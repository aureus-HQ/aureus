use soroban_sdk::{contract, contractimpl, Env, Map, Symbol, Val};

#[contract]
pub struct OracleContract;

#[contractimpl]
impl OracleContract {
    /// Set CPI inflation rate for a country (support multiple countries)
    pub fn set_cpi(env: Env, country: Symbol, cpi: i128) {
        let mut cpi_data: Map<Symbol, i128> = env
            .storage()
            .persistent()
            .get(&Symbol::new(&env, "cpi"))
            .unwrap_or(Map::new(&env));

        cpi_data.set(country.clone(), cpi);

        env.storage()
            .persistent()
            .set(&Symbol::new(&env, "cpi"), &cpi_data);

        env.events().publish(
            (Symbol::new(&env, "set_cpi"), country),
            cpi,
        );
    }

    /// Set CPI for multiple countries at once
    pub fn set_multi_cpi(env: Env, data: Map<Symbol, i128>) {
        env.storage()
            .persistent()
            .set(&Symbol::new(&env, "cpi"), &data);

        env.events().publish(
            Symbol::new(&env, "set_multi_cpi"),
            data.len(),
        );
    }

    /// Get CPI for a country
    pub fn get_cpi(env: Env, country: Symbol) -> i128 {
        let cpi_data: Map<Symbol, i128> = env
            .storage()
            .persistent()
            .get(&Symbol::new(&env, "cpi"))
            .unwrap_or(Map::new(&env));

        cpi_data.get(country).unwrap_or(0)
    }

    /// Set FX rate for a currency pair (supports multiple pairs)
    pub fn set_fx(env: Env, pair: Symbol, rate: i128) {
        let mut fx_data: Map<Symbol, i128> = env
            .storage()
            .persistent()
            .get(&Symbol::new(&env, "fx"))
            .unwrap_or(Map::new(&env));

        fx_data.set(pair.clone(), rate);

        env.storage()
            .persistent()
            .set(&Symbol::new(&env, "fx"), &fx_data);

        env.events().publish(
            (Symbol::new(&env, "set_fx"), pair),
            rate,
        );
    }

    /// Set multiple FX rates
    pub fn set_multi_fx(env: Env, data: Map<Symbol, i128>) {
        env.storage()
            .persistent()
            .set(&Symbol::new(&env, "fx"), &data);

        env.events().publish(
            Symbol::new(&env, "set_multi_fx"),
            data.len(),
        );
    }

    /// Get FX rate for a pair
    pub fn get_fx(env: Env, pair: Symbol) -> i128 {
        let fx_data: Map<Symbol, i128> = env
            .storage()
            .persistent()
            .get(&Symbol::new(&env, "fx"))
            .unwrap_or(Map::new(&env));

        fx_data.get(pair).unwrap_or(0)
    }

    /// Set asset price (supports multiple assets like GOLD, BONDS, STOCKS)
    pub fn set_asset_price(env: Env, asset: Symbol, price: i128) {
        let mut asset_data: Map<Symbol, i128> = env
            .storage()
            .persistent()
            .get(&Symbol::new(&env, "assets"))
            .unwrap_or(Map::new(&env));

        asset_data.set(asset.clone(), price);

        env.storage()
            .persistent()
            .set(&Symbol::new(&env, "assets"), &asset_data);

        env.events().publish(
            (Symbol::new(&env, "set_asset"), asset),
            price,
        );
    }

    /// Set multiple asset prices
    pub fn set_multi_asset_price(env: Env, data: Map<Symbol, i128>) {
        env.storage()
            .persistent()
            .set(&Symbol::new(&env, "assets"), &data);

        env.events().publish(
            Symbol::new(&env, "set_multi_asset"),
            data.len(),
        );
    }

    /// Get asset price
    pub fn get_asset_price(env: Env, asset: Symbol) -> i128 {
        let asset_data: Map<Symbol, i128> = env
            .storage()
            .persistent()
            .get(&Symbol::new(&env, "assets"))
            .unwrap_or(Map::new(&env));

        asset_data.get(asset).unwrap_or(0)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::testutils::Env as _;

    #[test]
    fn test_set_get_cpi() {
        let env = Env::default();
        let contract_id = env.register_contract(None, OracleContract);
        let client = OracleContractClient::new(&env, &contract_id);

        let country = Symbol::new(&env, "USA");
        client.set_cpi(&country, &250);

        assert_eq!(client.get_cpi(&country), 250);
    }

    #[test]
    fn test_set_get_fx() {
        let env = Env::default();
        let contract_id = env.register_contract(None, OracleContract);
        let client = OracleContractClient::new(&env, &contract_id);

        let pair = Symbol::new(&env, "USDNGN");
        client.set_fx(&pair, &1000);

        assert_eq!(client.get_fx(&pair), 1000);
    }

    #[test]
    fn test_set_get_asset_price() {
        let env = Env::default();
        let contract_id = env.register_contract(None, OracleContract);
        let client = OracleContractClient::new(&env, &contract_id);

        let asset = Symbol::new(&env, "GOLD");
        client.set_asset_price(&asset, &2000);

        assert_eq!(client.get_asset_price(&asset), 2000);
    }
}
