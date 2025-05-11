   CREATE INDEX IF NOT EXISTS idx_txs_contract_call_contract_id ON txs (contract_call_contract_id);
   CREATE INDEX IF NOT EXISTS idx_principal_stx_txs_principal ON principal_stx_txs (principal);
   CREATE INDEX IF NOT EXISTS idx_stx_events_sender ON stx_events (sender);
   CREATE INDEX IF NOT EXISTS idx_stx_events_recipient ON stx_events (recipient);
   CREATE INDEX IF NOT EXISTS idx_ft_events_sender ON ft_events (sender);
   CREATE INDEX IF NOT EXISTS idx_ft_events_recipient ON ft_events (recipient);
   CREATE INDEX IF NOT EXISTS idx_nft_events_sender ON nft_events (sender);
   CREATE INDEX IF NOT EXISTS idx_nft_events_recipient ON nft_events (recipient);
