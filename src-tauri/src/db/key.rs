use thiserror::Error;

#[derive(Debug, Error)]
pub enum KeyError {
    #[error("keyring error: {0}")]
    Keyring(#[from] keyring::Error),
}

pub trait KeyProvider {
    fn get_or_create_key(&self) -> Result<String, KeyError>;
}

const SERVICE: &str = "digital-guardian";
const USERNAME: &str = "sqlcipher-key";

pub struct OsKeyringKeyProvider;

impl KeyProvider for OsKeyringKeyProvider {
    fn get_or_create_key(&self) -> Result<String, KeyError> {
        let entry = keyring::Entry::new(SERVICE, USERNAME)?;
        match entry.get_password() {
            Ok(key) => Ok(key),
            Err(keyring::Error::NoEntry) => {
                let key = generate_key();
                entry.set_password(&key)?;
                Ok(key)
            }
            Err(e) => Err(e.into()),
        }
    }
}

fn generate_key() -> String {
    use rand::Rng;
    let bytes: [u8; 32] = rand::thread_rng().gen();
    bytes.iter().map(|b| format!("{:02x}", b)).collect()
}

#[cfg(test)]
pub struct StaticKeyProvider(pub String);

#[cfg(test)]
impl KeyProvider for StaticKeyProvider {
    fn get_or_create_key(&self) -> Result<String, KeyError> {
        Ok(self.0.clone())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn static_key_provider_returns_fixed_key() {
        let provider = StaticKeyProvider("test-key-123".to_string());
        assert_eq!(provider.get_or_create_key().unwrap(), "test-key-123");
    }

    #[test]
    fn generated_key_is_64_hex_chars() {
        let key = generate_key();
        assert_eq!(key.len(), 64);
        assert!(key.chars().all(|c| c.is_ascii_hexdigit()));
    }
}
