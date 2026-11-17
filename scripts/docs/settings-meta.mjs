/**
 * The human layer over the generated settings reference. Every stored key the app exposes
 * must have one row here; `gen-settings.mjs` fails when the product source and this file
 * disagree. Keep summaries public: no internal paths, crate names or module names.
 */

export const GROUPS = [
  {
    id: "containment",
    title: "Containment",
    blurb: "What a shell command may touch, and whether a run works in place or in a copy.",
  },
  {
    id: "firewall",
    title: "Firewall",
    blurb: "What happens when a sandboxed command reaches a host.",
  },
  {
    id: "approvals",
    title: "Approvals",
    blurb: "When a person is asked, and what the reviewer may approve.",
  },
  {
    id: "verification",
    title: "Verification",
    blurb: "What a Build or Debug run has to show before it can call itself done.",
  },
  {
    id: "second-opinion",
    title: "Second opinion",
    blurb: "A model from another lab reads the claim after the local checks.",
  },
  {
    id: "models",
    title: "Models and spend",
    blurb: "The model new threads start on, the helper models, context and the daily cap.",
  },
  {
    id: "tools",
    title: "Tools",
    blurb: "MCP, the browser, subagents, instructions and attachments.",
  },
  {
    id: "agents",
    title: "Claude Code, Codex and ACP agents",
    blurb: "Agents that run their own loop, and how Quaka contains them.",
  },
  {
    id: "memory-sync",
    title: "Memory and sync",
    blurb: "Notes every thread gets, and the relay that carries threads between your devices.",
  },
  {
    id: "github",
    title: "GitHub",
    blurb: "Pull request watching, CI fixes and @quaka commands.",
  },
  {
    id: "chat",
    title: "Chat and alerts",
    blurb: "Dictation, banners and spoken status.",
  },
  {
    id: "replay",
    title: "Replay",
    blurb: "How many attempts a Replay task gets, and how long one may take.",
  },
  {
    id: "integrations",
    title: "Integrations",
    blurb: "The address the hosted team bot is managed through.",
  },
];

/** `group` is a GROUPS id. `summary` is one or two plain sentences. */
export const META = {
  sandbox_enabled: {
    group: "containment",
    label: "Sandbox shell commands",
    summary:
      "Runs shell commands inside the operating system's sandbox, with writes limited to the project, temporary folders and package caches.",
  },
  sandbox_network: {
    group: "containment",
    label: "Sandboxed commands may use the network",
    summary:
      "Lets sandboxed commands reach the network. Off, package installs and dev servers that fetch anything fail.",
  },
  sandbox_container_socket: {
    group: "containment",
    label: "Sandboxed commands may use Docker",
    summary:
      "Lets sandboxed commands reach Docker's or Podman's socket. A container can mount any folder on the machine, so this opens a way around the sandbox.",
  },
  air_gapped: {
    group: "containment",
    label: "Air-gapped mode",
    summary:
      "Only local models run. Web search is removed, the browser opens localhost only, and shell commands lose the network.",
  },
  undo_tainted_runs: {
    group: "containment",
    label: "Work in a copy after someone else's text",
    summary:
      "A run started from an issue, a pull request or a page works in a copy. Routine work in the copy runs; pushes, pull requests and MCP calls wait for one apply.",
  },
  undo_browsing_runs: {
    group: "containment",
    label: "Work in a copy when a task links to a site",
    summary:
      "A message that links to a site off this machine starts in a copy, before the page is read. Reading the page still marks the run as untrusted.",
  },
  network_firewall: {
    group: "firewall",
    label: "Network firewall",
    summary:
      "What the firewall does with hosts a sandboxed command reaches: off, observe every host, ask about unknown hosts, or allow only known ones.",
  },
  approval_mode: {
    group: "approvals",
    label: "When to ask",
    summary:
      "Smart asks for risky calls and anything that leaves the project. Always ask asks for every side effect. Auto adds a reviewer that may approve calls that fit your policy.",
  },
  review_policy: {
    group: "approvals",
    label: "Review policy",
    summary:
      "The text the reviewer uses in Auto, and the policy that can make Smart ask. Up to 10,000 characters.",
  },
  verify_done: {
    group: "verification",
    label: "Verify before done",
    summary:
      "What a Build or Debug run that changed files must show: off, report failing checks, or block the done claim until they pass.",
  },
  verify_attempts: {
    group: "verification",
    label: "Retries after a failed check",
    summary: "In block mode, how many times a failed verification goes back to the model.",
  },
  verify_timeout_secs: {
    group: "verification",
    label: "Time for the fail-to-pass check",
    summary: "Seconds the check may take, both checkouts together. 30 to 3,600.",
  },
  verify_strict_tests: {
    group: "verification",
    label: "Strict new tests",
    summary:
      "A new or changed test that passes without the change fails verification instead of only warning.",
  },
  second_opinion_model: {
    group: "second-opinion",
    label: "Second opinion model",
    summary:
      "The model from another lab that reads the claim. Unset, or the run's own lab, means no second opinion.",
  },
  second_opinion_done: {
    group: "second-opinion",
    label: "Second opinion on done",
    summary:
      "Another lab checks a run's done claim once verification proves it or its checks pass.",
  },
  second_opinion_review: {
    group: "second-opinion",
    label: "Second opinion on review findings",
    summary: "Another lab labels each finding a structured review kept.",
  },
  default_model: {
    group: "models",
    label: "Default model",
    summary:
      "The model new threads start with. The model menu writes it; runs Quaka starts on its own also read it.",
  },
  agent_effort: {
    group: "models",
    label: "Reasoning effort",
    summary:
      "The default depth of thinking: the model's own, low, medium, high, extra high or max. Clamped to what each model accepts.",
  },
  full_context: {
    group: "models",
    label: "Use each model's whole context window",
    summary:
      "Sends up to each model's whole context window instead of capping a thread at 200K tokens. Long threads cost more per message.",
  },
  background_tier: {
    group: "models",
    label: "Half-price thread summaries",
    summary:
      "How a summary that a long thread needs is bought: off, flex, or flex and batch. A summary not ready when you send is cancelled and made at the normal price.",
  },
  agent_small_model_v2: {
    group: "models",
    label: "Small model for side jobs",
    summary:
      "The provider and model for summaries, explore subtasks, review checks and automation conditions. Unset uses the thread's model.",
  },
  image_model: {
    group: "models",
    label: "Model that describes images",
    summary:
      "Describes an image for a model that cannot see it. Unset uses the small model, then Claude Haiku when an Anthropic key is saved.",
  },
  decision_layer_enabled: {
    group: "models",
    label: "Decision layer",
    summary:
      "Asks a local model about real decisions in the background and logs its answers. It never decides anything.",
  },
  daily_budget_usd: {
    group: "models",
    label: "Daily spend cap",
    summary:
      "Runs pause and ask when today's spend reaches this amount. 0 turns the cap off. Counted per UTC day.",
  },
  model_prices: {
    group: "models",
    label: "Prices for other models",
    summary:
      "USD per million tokens for models Quaka has no built-in price for, as JSON, so the daily cap can count them.",
  },
  model_windows: {
    group: "models",
    label: "Learned context windows",
    summary:
      "Context sizes learned from providers' too-long errors, for endpoints that do not publish them. Written by the app.",
  },
  mcp_defer: {
    group: "tools",
    label: "Load MCP tools on demand",
    summary:
      "With eight or more MCP tools connected, send a one-line index and load the schemas a step needs instead of every schema on every step.",
  },
  mcp_code_mode: {
    group: "tools",
    label: "Let the agent script MCP tools",
    summary:
      "Offers a short JavaScript program over MCP results. Each MCP call the program makes still asks, as a direct call would.",
  },
  real_browser: {
    group: "tools",
    label: "Use your own browser",
    summary:
      "Lets the agent use your browser through Quaka's extension, with your signed-in sessions.",
  },
  undo_read_only_mcp: {
    group: "tools",
    label: "Read-only MCP servers",
    summary:
      "Servers whose tools an undoable run may call directly, because they only read. Names are comma separated.",
  },
  subagent_concurrency: {
    group: "tools",
    label: "Parallel explore subtasks",
    summary: "How many read-only explore subtasks one turn runs at once. 1 to 16.",
  },
  writer_concurrency: {
    group: "tools",
    label: "Parallel writers",
    summary: "How many writer subagents run at once, each in its own worktree. 1 to 8.",
  },
  instructions_global_claude: {
    group: "tools",
    label: "Also use the personal Claude Code instructions",
    summary:
      "Adds the personal Claude Code instructions file to every run. Off by default: another tool's personal file is not read without asking.",
  },
  instructions_global_codex: {
    group: "tools",
    label: "Also use the personal Codex instructions",
    summary:
      "Adds the personal Codex instructions file to every run, or its override file when one exists. Off by default.",
  },
  provider_files: {
    group: "tools",
    label: "Upload attachments once",
    summary:
      "Uploads attached images and PDFs to the provider once and references them by ID afterwards, instead of sending their bytes every step.",
  },
  cli_sandbox_claude_code: {
    group: "agents",
    label: "Sandbox Claude Code",
    summary:
      "Runs Claude Code's own process inside the sandbox and under the firewall, and routes its tool calls through Quaka's approvals.",
  },
  cli_sandbox_codex: {
    group: "agents",
    label: "Sandbox Codex",
    summary:
      "Runs Codex's own process inside the sandbox and under the firewall.",
  },
  cli_account_switch: {
    group: "agents",
    label: "Switch accounts when one runs out",
    summary:
      "When one Claude Code or Codex subscription account runs out mid-work, continue on the next saved account.",
  },
  acp_agents: {
    group: "agents",
    label: "ACP agents",
    summary:
      "Agent Client Protocol agents Quaka can spawn and drive as the brain, with their launch commands.",
  },
  custom_providers: {
    group: "agents",
    label: "Custom providers",
    summary:
      "OpenAI-compatible providers added in Settings. Their keys stay in the operating system's keychain.",
  },
  memory_enabled: {
    group: "memory-sync",
    label: "Use memory",
    summary:
      "Gives every thread the notes in Memory, with any model, including Claude Code and Codex.",
  },
  sync_relay_url: {
    group: "memory-sync",
    label: "Sync relay",
    summary:
      "The relay device sync uses. Set per device when sync is turned on.",
  },
  github_watch_enabled: {
    group: "github",
    label: "Watch pull requests",
    summary:
      "Watches your pull requests for failing checks and review comments and starts a thread when one needs you.",
  },
  github_autofix_attempts: {
    group: "github",
    label: "CI fix attempts",
    summary:
      "How many times Quaka tries to fix a failing check before it asks instead. 0 turns CI fixes off.",
  },
  github_machine_users: {
    group: "github",
    label: "Machine users",
    summary:
      "GitHub logins whose comments are ignored, separated by commas, spaces or newlines.",
  },
  github_commands: {
    group: "github",
    label: "@quaka commands",
    summary:
      "Per repository, whether @quaka comments can start or steer a thread, and whether issue comments count.",
  },
  undoable_pr_wakes: {
    group: "github",
    label: "Undoable fixes and replies",
    summary:
      "Runs CI fixes and review replies in a copy, with pushes and replies held for one apply.",
  },
  dictation_model: {
    group: "chat",
    label: "Dictation model",
    summary: "The speech-to-text model dictation uses.",
  },
  notifications: {
    group: "chat",
    label: "Banners",
    summary: "Banners for threads you cannot see: all, only what needs you, or off.",
  },
  speech_enabled: {
    group: "chat",
    label: "Speak status",
    summary: "Speaks a thread's status through the operating system's speech engine.",
  },
  speech_when: {
    group: "chat",
    label: "When to speak",
    summary: "Only while no Quaka window has focus, or always.",
  },
  speech_voice: {
    group: "chat",
    label: "Voice",
    summary: "A voice name from the system's available voices. Empty uses the system default.",
  },
  speech_volume: {
    group: "chat",
    label: "Speech volume",
    summary: "Speech volume, in percent. 10 to 100.",
  },
  replay_repeats: {
    group: "replay",
    label: "Repeats per task",
    summary:
      "How many graded attempts each task and config is topped up to. 1 to 20.",
  },
  replay_attempt_minutes: {
    group: "replay",
    label: "Minutes per attempt",
    summary:
      "How long one Replay attempt may run before it is stopped and graded as it is. 5 to 240.",
  },
  team_bot_url: {
    group: "integrations",
    label: "Team bot address",
    summary:
      "The address the hosted team bot is managed through. Empty uses the default.",
  },
};
