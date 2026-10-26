param()
$cwd = "c:\Users\DELL\OneDrive\Desktop\drip\Bazaar-2"
$tmp = "$env:TEMP\bazaar_patch"
$libPath   = "$cwd\contracts\ai-agent-marketplace\src\lib.rs"
$testPath  = "$cwd\contracts\ai-agent-marketplace\src\test.rs"
$mpPath    = "$cwd\frontend\ai-agent-marketplace\src\pages\Marketplace.tsx"
$dashPath  = "$cwd\frontend\ai-agent-marketplace\src\pages\Dashboard.tsx"
$apPath    = "$cwd\frontend\ai-agent-marketplace\src\pages\AgentProfile.tsx"
$jdPath    = "$cwd\frontend\ai-agent-marketplace\src\pages\JobDetail.tsx"

function C([string]$msg) {
    git -C $cwd add -A
    git -C $cwd commit -m $msg
}

# ────────────────────────────────────────────────────────────────
# COMMIT 4 – paginate get_jobs_by_client
# ────────────────────────────────────────────────────────────────
$c = Get-Content $libPath -Raw
$c = $c -replace '(?s)(    /// Get jobs by client\r?\n    pub fn get_jobs_by_client\(env: Env, client: Address\) -> Vec<u64> \{.*?\n    \})', @'
    /// Get jobs posted by a specific client (paginated).
    ///
    /// Returns up to `limit` job IDs from the client index starting at
    /// zero-based `offset`.  An empty Vec is returned when `offset` >= total
    /// or `limit` is 0.  Callers should walk pages by incrementing `offset`
    /// by `limit` until the result length is less than `limit`.
    pub fn get_jobs_by_client(env: Env, client: Address, offset: u64, limit: u64) -> Vec<u64> {
        let all: Vec<u64> = env.storage().instance()
            .get(&DataKey::JobsByClient(client))
            .unwrap_or(Vec::new(&env));
        Self::paginate(&env, &all, offset, limit)
    }
'@
Set-Content $libPath $c -NoNewline

C "feat(contract): paginate get_jobs_by_client(client, offset, limit)

get_jobs_by_client previously returned the entire Vec<u64> of job IDs
for a client with no upper bound on response size.

Changes in this commit:
- Signature: get_jobs_by_client(env, client, offset: u64, limit: u64)
- Reads the full stored Vec<u64> from JobsByClient(client).
- Delegates slicing to the private paginate() helper introduced in the
  previous commit.
- Returns an empty Vec when offset >= total length or limit is 0.
- Adds a full Rust doc-comment describing the pagination protocol.

Migration: any caller previously invoking get_jobs_by_client(client)
must now pass (client, 0, N) for the first page and continue with
(client, N, N), (client, 2N, N) etc. until the result is smaller than N."

# ────────────────────────────────────────────────────────────────
# COMMIT 5 – paginate get_jobs_by_agent
# ────────────────────────────────────────────────────────────────
$c = Get-Content $libPath -Raw
$c = $c -replace '(?s)(    /// Get jobs by agent\r?\n    pub fn get_jobs_by_agent\(env: Env, agent: Address\) -> Vec<u64> \{.*?\n    \})', @'
    /// Get jobs assigned to a specific agent (paginated).
    ///
    /// Returns up to `limit` job IDs from the agent index starting at
    /// zero-based `offset`.  An empty Vec is returned when `offset` >= total
    /// or `limit` is 0.
    pub fn get_jobs_by_agent(env: Env, agent: Address, offset: u64, limit: u64) -> Vec<u64> {
        let all: Vec<u64> = env.storage().instance()
            .get(&DataKey::JobsByAgent(agent))
            .unwrap_or(Vec::new(&env));
        Self::paginate(&env, &all, offset, limit)
    }
'@
Set-Content $libPath $c -NoNewline

C "feat(contract): paginate get_jobs_by_agent(agent, offset, limit)

get_jobs_by_agent previously returned all job IDs assigned to an agent
without bounds, creating the same RPC-size risk as get_jobs_by_client.

Changes:
- Added offset: u64 and limit: u64 parameters.
- Reads JobsByAgent(agent) Vec in full, then slices via paginate().
- Out-of-bounds offset returns an empty Vec (no panic).
- Doc-comment documents the offset-based pagination protocol.

The underlying storage format is unchanged; this is a query-only change.
No migration is needed for existing stored data."

# ────────────────────────────────────────────────────────────────
# COMMIT 6 – paginate get_bids_by_job
# ────────────────────────────────────────────────────────────────
$c = Get-Content $libPath -Raw
$c = $c -replace '(?s)(    /// Get bids by job\r?\n    pub fn get_bids_by_job\(env: Env, job_id: u64\) -> Vec<u64> \{.*?\n    \})', @'
    /// Get bids placed on a specific job (paginated).
    ///
    /// Returns up to `limit` bid IDs for `job_id` starting at zero-based
    /// `offset`.  Returns an empty Vec when `offset` >= total or `limit` == 0.
    pub fn get_bids_by_job(env: Env, job_id: u64, offset: u64, limit: u64) -> Vec<u64> {
        let all: Vec<u64> = env.storage().instance()
            .get(&DataKey::BidsByJob(job_id))
            .unwrap_or(Vec::new(&env));
        Self::paginate(&env, &all, offset, limit)
    }
'@
Set-Content $libPath $c -NoNewline

C "feat(contract): paginate get_bids_by_job(job_id, offset, limit)

A popular job can accumulate dozens or hundreds of bids.
get_bids_by_job previously returned ALL bid IDs for a job in one call,
causing potential XDR budget overflow in high-activity markets.

Changes:
- Signature extended to get_bids_by_job(env, job_id, offset, limit).
- Full BidsByJob Vec loaded from storage then sliced via paginate().
- Note: internal calls in place_bid / withdraw_bid / accept_bid still
  read BidsByJob directly from storage (not through this public fn),
  so those code paths are unaffected by the signature change.
- Returns empty Vec for out-of-bounds offset or zero limit.

This is a breaking change to the public ABI; all consumers must add
the two extra u64 arguments."

# ────────────────────────────────────────────────────────────────
# COMMIT 7 – paginate get_bids_by_agent
# ────────────────────────────────────────────────────────────────
$c = Get-Content $libPath -Raw
$c = $c -replace '(?s)(    /// Get bids by agent\r?\n    pub fn get_bids_by_agent\(env: Env, agent: Address\) -> Vec<u64> \{.*?\n    \})', @'
    /// Get bids placed by a specific agent (paginated).
    ///
    /// Returns up to `limit` bid IDs from the agent bid index starting at
    /// zero-based `offset`.  Returns an empty Vec when `offset` >= total or
    /// `limit` == 0.
    pub fn get_bids_by_agent(env: Env, agent: Address, offset: u64, limit: u64) -> Vec<u64> {
        let all: Vec<u64> = env.storage().instance()
            .get(&DataKey::BidsByAgent(agent))
            .unwrap_or(Vec::new(&env));
        Self::paginate(&env, &all, offset, limit)
    }
'@
Set-Content $libPath $c -NoNewline

C "feat(contract): paginate get_bids_by_agent(agent, offset, limit)

An active agent bidding on many jobs will eventually have a BidsByAgent
Vec large enough to overflow the RPC response size limit.

Changes:
- Signature extended to get_bids_by_agent(env, agent, offset, limit).
- Reads BidsByAgent(agent) Vec from instance storage.
- Delegates to paginate() to return only the requested slice.
- Guard conditions: empty Vec for out-of-bounds offset or zero limit.

Internal callers (place_bid, withdraw_bid) still read BidsByAgent
directly from storage and are unaffected by this signature change."

# ────────────────────────────────────────────────────────────────
# COMMIT 8 – paginate get_reviews_by_reviewee
# ────────────────────────────────────────────────────────────────
$c = Get-Content $libPath -Raw
$c = $c -replace '(?s)(    /// Get reviews for an agent/user\r?\n    pub fn get_reviews_by_reviewee\(env: Env, reviewee: Address\) -> Vec<u64> \{.*?\n    \})', @'
    /// Get reviews written about a user/agent (paginated).
    ///
    /// Returns up to `limit` review IDs for `reviewee` starting at
    /// zero-based `offset`.  Returns an empty Vec when `offset` >= total or
    /// `limit` == 0.
    pub fn get_reviews_by_reviewee(env: Env, reviewee: Address, offset: u64, limit: u64) -> Vec<u64> {
        let all: Vec<u64> = env.storage().instance()
            .get(&DataKey::ReviewsByReviewee(reviewee))
            .unwrap_or(Vec::new(&env));
        Self::paginate(&env, &all, offset, limit)
    }
'@
Set-Content $libPath $c -NoNewline

C "feat(contract): paginate get_reviews_by_reviewee(reviewee, offset, limit)

A prolific agent with many completed jobs will accumulate a large review
list.  Returning all reviews in one call would exceed the RPC size limit.

Changes:
- Signature extended to (env, reviewee, offset: u64, limit: u64).
- Reads ReviewsByReviewee(reviewee) Vec then delegates to paginate().
- Returns empty Vec for out-of-bounds offset or zero limit.
- Doc-comment explains the pagination protocol to callers.

Note: leave_review still writes to ReviewsByReviewee directly via
DataKey storage and is unaffected by this query-API change."

# ────────────────────────────────────────────────────────────────
# COMMIT 9 – paginate get_agents_by_skill
# ────────────────────────────────────────────────────────────────
$c = Get-Content $libPath -Raw
$c = $c -replace '(?s)(    /// Get agents by skill\r?\n    pub fn get_agents_by_skill\(env: Env, skill: String\) -> Vec<u64> \{.*?\n    \})', @'
    /// Get agents that have a specific skill (paginated).
    ///
    /// Returns up to `limit` agent IDs from the skill index starting at
    /// zero-based `offset`.  Returns an empty Vec when `offset` >= total or
    /// `limit` == 0.
    pub fn get_agents_by_skill(env: Env, skill: String, offset: u64, limit: u64) -> Vec<u64> {
        let all: Vec<u64> = env.storage().instance()
            .get(&DataKey::SkillAgents(skill))
            .unwrap_or(Vec::new(&env));
        Self::paginate(&env, &all, offset, limit)
    }
'@
Set-Content $libPath $c -NoNewline

C "feat(contract): paginate get_agents_by_skill(skill, offset, limit)

Popular skills like 'python' or 'rust' will eventually have hundreds of
agents registered against them.  Returning the full list in one RPC call
is unsustainable at scale.

Changes:
- Signature extended to (env, skill, offset: u64, limit: u64).
- Reads SkillAgents(skill) Vec from instance storage.
- Slices via paginate() to stay within the RPC response size budget.
- Returns empty Vec for out-of-bounds offset or zero limit.

This completes the set of six paginated query functions:
  get_jobs_by_client, get_jobs_by_agent, get_bids_by_job,
  get_bids_by_agent, get_reviews_by_reviewee, get_agents_by_skill.

All six now share the same offset+limit interface and the same
paginate() implementation."

# ────────────────────────────────────────────────────────────────
# COMMIT 10 – clean up the doc-comment notes added in commits 1-2
# ────────────────────────────────────────────────────────────────
# Apply the final lib.rs from tmp (which has clean docs, no scratch notes)
Copy-Item "$tmp\lib.rs" $libPath

C "refactor(contract): replace scratch notes with clean inline doc-comments

Commits 1 and 2 added temporary comment blocks to track the problem
and proposed solution.  Now that all six query functions have been
updated those scaffold comments are no longer needed.

This commit replaces them with the final, production-quality versions:
- paginate() has a full Rust doc-comment (///) with argument docs.
- Each query function has a concise doc-comment explaining its
  pagination semantics, arguments, and caller protocol.
- The temporary PAGINATION REFACTOR NOTE and RECOMMENDED_PAGE_LIMIT
  placeholder have been removed.

No functional change; only doc-comment content changes."

Write-Host "Commits 4-10 done"
