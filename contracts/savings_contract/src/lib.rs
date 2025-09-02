use soroban_sdk::{contract, contractimpl, Address, Env, Map, Symbol, token};

#[contract]
pub struct SavingsContract;

#[contractimpl]
impl SavingsContract {
    /// Initialize the contract with the stablecoin token address and oracle address
    pub fn init(env: Env, token_address: Address, oracle_address: Address) {
        env.storage().instance().set(&Symbol::new(&env, "token"), &token_address);
        env.storage().instance().set(&Symbol::new(&env, "oracle"), &oracle_address);
    }

    /// Deposit stablecoins into the savings account
    pub fn deposit(env: Env, user: Address, amount: i128) {
        user.require_auth();

        let token_address: Address = env.storage().instance().get(&Symbol::new(&env, "token")).unwrap();
        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&user, &env.current_contract_address(), &amount);

        let mut balances: Map<Address, i128> = env
            .storage()
            .persistent()
            .get(&Symbol::new(&env, "balances"))
            .unwrap_or(Map::new(&env));

        let current_balance = balances.get(user.clone()).unwrap_or(0);
        balances.set(user.clone(), current_balance + amount);

        env.storage()
            .persistent()
            .set(&Symbol::new(&env, "balances"), &balances);

        // Emit event
        env.events().publish(
            (Symbol::new(&env, "deposit"), user),
            amount,
        );
    }

    /// Withdraw stablecoins if not locked
    pub fn withdraw(env: Env, user: Address, amount: i128) {
        user.require_auth();

        let mut balances: Map<Address, i128> = env
            .storage()
            .persistent()
            .get(&Symbol::new(&env, "balances"))
            .unwrap_or(Map::new(&env));

        let current_balance = balances.get(user.clone()).unwrap_or(0);
        if current_balance < amount {
            panic!("Insufficient balance");
        }

        // Check lock
        let locks: Map<Address, u64> = env
            .storage()
            .persistent()
            .get(&Symbol::new(&env, "locks"))
            .unwrap_or(Map::new(&env));

        let lock_until = locks.get(user.clone()).unwrap_or(0);
        if env.ledger().timestamp() < lock_until {
            panic!("Funds are locked");
        }

        balances.set(user.clone(), current_balance - amount);

        env.storage()
            .persistent()
            .set(&Symbol::new(&env, "balances"), &balances);

        // Transfer tokens back to user
        let token_address: Address = env.storage().instance().get(&Symbol::new(&env, "token")).unwrap();
        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&env.current_contract_address(), &user, &amount);

        // Emit event
        env.events().publish(
            (Symbol::new(&env, "withdraw"), user),
            amount,
        );
    }

    /// Lock funds for a period
    pub fn lock_funds(env: Env, user: Address, lock_duration: u64) {
        user.require_auth();

        let mut locks: Map<Address, u64> = env
            .storage()
            .persistent()
            .get(&Symbol::new(&env, "locks"))
            .unwrap_or(Map::new(&env));

        let lock_until = env.ledger().timestamp() + lock_duration;
        locks.set(user.clone(), lock_until);

        env.storage()
            .persistent()
            .set(&Symbol::new(&env, "locks"), &locks);

        // Emit event
        env.events().publish(
            (Symbol::new(&env, "lock"), user),
            lock_until,
        );
    }

    /// Get balance
    pub fn get_balance(env: Env, user: Address) -> i128 {
        let balances: Map<Address, i128> = env
            .storage()
            .persistent()
            .get(&Symbol::new(&env, "balances"))
            .unwrap_or(Map::new(&env));

        balances.get(user).unwrap_or(0)
    }

    /// Get lock status
    pub fn get_lock_status(env: Env, user: Address) -> u64 {
        let locks: Map<Address, u64> = env
            .storage()
            .persistent()
            .get(&Symbol::new(&env, "locks"))
            .unwrap_or(Map::new(&env));

        locks.get(user).unwrap_or(0)
    }

    /// Rebalance based on inflation data from oracle
    pub fn rebalance(env: Env, user: Address, country: Symbol) {
        let oracle_address: Address = env.storage().instance().get(&Symbol::new(&env, "oracle")).unwrap();

        // Call oracle to get CPI
        let cpi: i128 = env.invoke_contract(
            &oracle_address,
            &Symbol::new(&env, "get_cpi"),
            (country,).into_val(&env),
        );

        // Threshold for high inflation
        let threshold = 200; // e.g., 2.00

        if cpi > threshold {
            // Extend lock by 1 year
            let mut locks: Map<Address, u64> = env
                .storage()
                .persistent()
                .get(&Symbol::new(&env, "locks"))
                .unwrap_or(Map::new(&env));

            let current_lock = locks.get(user.clone()).unwrap_or(0);
            let new_lock = env.ledger().timestamp() + 31536000; // 1 year
            if new_lock > current_lock {
                locks.set(user.clone(), new_lock);
                env.storage()
                    .persistent()
                    .set(&Symbol::new(&env, "locks"), &locks);

                env.events().publish(
                    (Symbol::new(&env, "rebalance"), user),
                    new_lock,
                );
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::testutils::{Address as _, Env as _};

    #[test]
    fn test_deposit() {
        let env = Env::default();
        let contract_id = env.register_contract(None, SavingsContract);
        let client = SavingsContractClient::new(&env, &contract_id);

        let user = Address::generate(&env);
        client.deposit(&user, &100);

        assert_eq!(client.get_balance(&user), 100);
    }

    #[test]
    fn test_withdraw() {
        let env = Env::default();
        let contract_id = env.register_contract(None, SavingsContract);
        let client = SavingsContractClient::new(&env, &contract_id);

        let user = Address::generate(&env);
        client.deposit(&user, &100);
        client.withdraw(&user, &50);

        assert_eq!(client.get_balance(&user), 50);
    }

    #[test]
    fn test_lock() {
        let env = Env::default();
        let contract_id = env.register_contract(None, SavingsContract);
        let client = SavingsContractClient::new(&env, &contract_id);

        let user = Address::generate(&env);
        client.deposit(&user, &100);
        client.lock_funds(&user, &1000); // lock for 1000 seconds

        // Try to withdraw, should fail if locked
        // But in test, timestamp is 0, so lock_until = 1000 > 0, so panic
        // For test, perhaps set timestamp
        env.ledger().set_timestamp(2000);
        client.withdraw(&user, &50); // should work now
    }
}
