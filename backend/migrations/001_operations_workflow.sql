BEGIN;
CREATE TABLE IF NOT EXISTS operation_plans (
 id BIGSERIAL PRIMARY KEY, tenant_id TEXT NOT NULL, site_ref TEXT NOT NULL, plan_ref TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'planned', constraint_version TEXT NOT NULL, jobs JSONB NOT NULL, safety_limits JSONB NOT NULL,
 input_as_of TIMESTAMPTZ NOT NULL, idempotency_key TEXT NOT NULL, created_by TEXT NOT NULL, version INTEGER NOT NULL DEFAULT 1,
 fallback_procedure TEXT NOT NULL, failure_code TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(tenant_id,site_ref,plan_ref), UNIQUE(tenant_id,idempotency_key)
);
CREATE TABLE IF NOT EXISTS operation_events (
 id BIGSERIAL PRIMARY KEY, tenant_id TEXT NOT NULL, site_ref TEXT NOT NULL, asset_ref TEXT NOT NULL,
 source_ref TEXT NOT NULL, sequence BIGINT NOT NULL, event_type TEXT NOT NULL, schema_version TEXT NOT NULL,
 payload JSONB NOT NULL, recorded_at TIMESTAMPTZ NOT NULL, received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 duplicate_of BIGINT, UNIQUE(tenant_id,source_ref,sequence)
);
CREATE TABLE IF NOT EXISTS operation_dispatches (
 id BIGSERIAL PRIMARY KEY, tenant_id TEXT NOT NULL, plan_ref TEXT NOT NULL, provider TEXT NOT NULL,
 idempotency_key TEXT NOT NULL, payload_checksum TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', receipt TEXT,
 attempt_count INTEGER NOT NULL DEFAULT 0, next_attempt_at TIMESTAMPTZ, last_error TEXT,
 UNIQUE(tenant_id,provider,idempotency_key)
);
CREATE TABLE IF NOT EXISTS operation_replays (
 id BIGSERIAL PRIMARY KEY, tenant_id TEXT NOT NULL, scenario_ref TEXT NOT NULL, fixture_version TEXT NOT NULL,
 forecast NUMERIC NOT NULL, actual NUMERIC NOT NULL, absolute_error NUMERIC NOT NULL, constraint_violations INTEGER NOT NULL,
 latency_ms INTEGER NOT NULL, missed_events INTEGER NOT NULL, realized_outcome JSONB NOT NULL,
 replayed_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(tenant_id,scenario_ref,fixture_version)
);
CREATE TABLE IF NOT EXISTS operation_workflow_audit (
 id BIGSERIAL PRIMARY KEY, tenant_id TEXT NOT NULL, plan_ref TEXT NOT NULL, from_status TEXT, to_status TEXT NOT NULL,
 actor_id TEXT NOT NULL, actor_role TEXT NOT NULL, reason TEXT NOT NULL, evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
 correlation_id TEXT NOT NULL, occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_operation_events_asset ON operation_events(tenant_id,site_ref,asset_ref,recorded_at);
CREATE INDEX IF NOT EXISTS idx_operation_dispatch_retry ON operation_dispatches(status,next_attempt_at);
CREATE UNIQUE INDEX IF NOT EXISTS uq_operation_audit_correlation ON operation_workflow_audit(tenant_id,plan_ref,correlation_id);
COMMIT;
