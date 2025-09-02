use soroban_sdk::{contract, contractimpl, Address, Env, Map, Symbol, token, Vec};

#[contract]
pub struct InflationHedgeContract;

#[contractimpl]
impl InflationHedgeContract {
    /// Initialize with oracle and asset addresses
    pub fn init(env: Env, oracle: Address, stable: Address, gold: Address, yield_token: Address) {
        env.storage().instance().set(&Symbol::new(&env, "oracle"), &oracle);
        env.storage().instance().set(&Symbol::new(&env, "stable"), &stable);
        env.storage().instance().set(&Symbol::new(&env, "gold"), &gold);
        env.storage().instance().set(&Symbol::new(&env, "yield"), &yield_token);
    }

    /// Deposit stablecoins and allocate to hedge assets
    pub fn deposit(env: Env, user: Address, amount: i128) {
        user.require_auth();

        let stable: Address = env.storage().instance().get(&Symbol::new(&env, "stable")).unwrap();
        let token_client = token::Client::new(&env, &stable);
        token_client.transfer(&user, &env.current_contract_address(), &amount);

        // Allocate: 50% stable, 30% gold, 20% yield (virtual)
        let stable_alloc = amount * 50 / 100;
        let gold_alloc = amount * 30 / 100;
        let yield_alloc = amount * 20 / 100;

        let mut allocations: Map<Address, Map<Symbol, i128>> = env
            .storage()
            .persistent()
            .get(&Symbol::new(&env, "allocations"))
            .unwrap_or(Map::new(&env));

        let mut user_alloc = allocations.get(user.clone()).unwrap_or(Map::new(&env));
        user_alloc.set(Symbol::new(&env, "stable"), user_alloc.get(Symbol::new(&env, "stable")).unwrap_or(0) + stable_alloc);
        user_alloc.set(Symbol::new(&env, "gold"), user_alloc.get(Symbol::new(&env, "gold")).unwrap_or(0) + gold_alloc);
        user_alloc.set(Symbol::new(&env, "yield"), user_alloc.get(Symbol::new(&env, "yield")).unwrap_or(0) + yield_alloc);

        allocations.set(user.clone(), user_alloc);
        env.storage()
            .persistent()
            .set(&Symbol::new(&env, "allocations"), &allocations);

        env.events().publish(
            (Symbol::new(&env, "deposit"), user),
            amount,
        );
    }

    /// Rebalance allocations based on oracle data
    pub fn rebalance(env: Env, user: Address, country: Symbol) {
        let oracle: Address = env.storage().instance().get(&Symbol::new(&env, "oracle")).unwrap();
        let cpi: i128 = env.invoke_contract(
            &oracle,
            &Symbol::new(&env, "get_cpi"),
            (country,).into_val(&env),
        );

        let mut allocations: Map<Address, Map<Symbol, i128>> = env
            .storage()
            .persistent()
            .get(&Symbol::new(&env, "allocations"))
            .unwrap_or(Map::new(&env));

        let mut user_alloc = allocations.get(user.clone()).unwrap_or(Map::new(&env));

        let total = user_alloc.get(Symbol::new(&env, "stable")).unwrap_or(0) +
                   user_alloc.get(Symbol::new(&env, "gold")).unwrap_or(0) +
                   user_alloc.get(Symbol::new(&env, "yield")).unwrap_or(0);

        if total > 0 {
            let (stable_pct, gold_pct, yield_pct) = if cpi > 200 {
                (30, 50, 20) // High inflation: more gold
            } else {
                (50, 30, 20) // Normal
            };

            user_alloc.set(Symbol::new(&env, "stable"), total * stable_pct / 100);
            user_alloc.set(Symbol::new(&env, "gold"), total * gold_pct / 100);
            user_alloc.set(Symbol::new(&env, "yield"), total * yield_pct / 100);

            allocations.set(user.clone(), user_alloc);
            env.storage()
                .persistent()
                .set(&Symbol::new(&env, "allocations"), &allocations);

            env.events().publish(
                (Symbol::new(&env, "rebalance"), user),
                cpi,
            );
        }
    }

    /// Withdraw from hedge positions
    pub fn withdraw(env: Env, user: Address, amount: i128) {
        user.require_auth();

        let mut allocations: Map<Address, Map<Symbol, i128>> = env
            .storage()
            .persistent()
            .get(&Symbol::new(&env, "allocations"))
            .unwrap_or(Map::new(&env));

        let mut user_alloc = allocations.get(user.clone()).unwrap_or(Map::new(&env));

        let total = user_alloc.get(Symbol::new(&env, "stable")).unwrap_or(0) +
                   user_alloc.get(Symbol::new(&env, "gold")).unwrap_or(0) +
                   user_alloc.get(Symbol::new(&env, "yield")).unwrap_or(0);

        if total < amount {
            panic!("Insufficient balance");
        }

        // Withdraw proportional
        let stable_withdraw = amount * user_alloc.get(Symbol::new(&env, "stable")).unwrap_or(0) / total;
        let gold_withdraw = amount * user_alloc.get(Symbol::new(&env, "gold")).unwrap_or(0) / total;
        let yield_withdraw = amount * user_alloc.get(Symbol::new(&env, "yield")).unwrap_or(0) / total;

        user_alloc.set(Symbol::new(&env, "stable"), user_alloc.get(Symbol::new(&env, "stable")).unwrap_or(0) - stable_withdraw);
        user_alloc.set(Symbol::new(&env, "gold"), user_alloc.get(Symbol::new(&env, "gold")).unwrap_or(0) - gold_withdraw);
        user_alloc.set(Symbol::new(&env, "yield"), user_alloc.get(Symbol::new(&env, "yield")).unwrap_or(0) - yield_withdraw);

        allocations.set(user.clone(), user_alloc);
        env.storage()
            .persistent()
            .set(&Symbol::new(&env, "allocations"), &allocations);

        // Transfer stable back (assuming withdraw in stable equivalent)
        let stable: Address = env.storage().instance().get(&Symbol::new(&env, "stable")).unwrap();
        let token_client = token::Client::new(&env, &stable);
        token_client.transfer(&env.current_contract_address(), &user, &amount);

        env.events().publish(
            (Symbol::new(&env, "withdraw"), user),
            amount,
        );
    }

    /// Get user allocation
    pub fn get_allocation(env: Env, user: Address) -> Map<Symbol, i128> {
        let allocations: Map<Address, Map<Symbol, i128>> = env
            .storage()
            .persistent()
            .get(&Symbol::new(&env, "allocations"))
            .unwrap_or(Map::new(&env));

        allocations.get(user).unwrap_or(Map::new(&env))
    }

    /// Hook for composability: allow external contracts to trigger rebalance
    pub fn external_rebalance(env: Env, user: Address, country: Symbol) {
        // Can add auth or conditions
        Self::rebalance(env, user, country);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::testutils::{Address as _, Env as _};

    #[test]
    fn test_deposit() {
        let env = Env::default();
        let contract_id = env.register_contract(None, InflationHedgeContract);
        let client = InflationHedgeContractClient::new(&env, &contract_id);

        let user = Address::generate(&env);
        // Assume init done
        // client.deposit(&user, &1000);

        // assert_eq!(client.get_allocation(&user).get(Symbol::new(&env, "stable")).unwrap_or(0), 500);
    }
}
