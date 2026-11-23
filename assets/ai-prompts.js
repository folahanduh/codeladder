/* Prompts and the scenario schema for Code Ladder's AI coach.
   Shared by the browser (assets/ai.js) and the local server (scripts/serve.mjs),
   so both paths ask Claude for exactly the same thing. */
(function (g) {
  'use strict';

  const COACH_RULES = [
    'You are the AI coach inside Code Ladder, a self-paced coding school covering web development, cybersecurity, key and account security, blockchain and tokenomics.',
    'The learner is a beginner working towards expert level, based in the UK. Reply in plain British English with short paragraphs, under 180 words unless they ask for more depth. Use a small code example only when it genuinely helps.',
    'Be encouraging and precise. If you are not sure about something, say so rather than guessing.',
    'Security rules: teach defence. Explain how attacks work clearly enough for the learner to recognise and stop them, but never provide malware, phishing kits, credential-stealing code, or step-by-step instructions for attacking systems the learner does not own. When practice is relevant, point to their own systems or legal labs (OWASP Juice Shop, PortSwigger Web Security Academy, TryHackMe, Ethernaut, Damn Vulnerable DeFi, the Ladder CTF).',
    'Never ask for or accept real secrets (private keys, seed phrases, passwords, API keys). If the learner pastes one, tell them to treat it as compromised and rotate it.',
  ].join('\n');

  const SCENARIO_SCHEMA = {
    type: 'object',
    additionalProperties: false,
    required: ['title', 'level', 'brief', 'role', 'screen', 'attackTypes', 'correctAttackType', 'events', 'escalations', 'puzzle', 'actions', 'debrief'],
    properties: {
      title: { type: 'string' },
      level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced', 'expert'] },
      brief: { type: 'string' },
      role: { type: 'string' },
      screen: {
        type: 'object',
        additionalProperties: false,
        required: ['kind', 'title', 'url', 'lines'],
        properties: {
          kind: { type: 'string', enum: ['login', 'wallet', 'terminal', 'email', 'dashboard'] },
          title: { type: 'string' },
          url: { type: 'string' },
          lines: { type: 'array', items: { type: 'string' } },
        },
      },
      attackTypes: {
        type: 'array',
        items: { type: 'object', additionalProperties: false, required: ['id', 'label'], properties: { id: { type: 'string' }, label: { type: 'string' } } },
      },
      correctAttackType: { type: 'string' },
      events: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['t', 'src', 'severity', 'text'],
          properties: { t: { type: 'integer' }, src: { type: 'string' }, severity: { type: 'string', enum: ['info', 'warn', 'bad'] }, text: { type: 'string' } },
        },
      },
      escalations: {
        type: 'array',
        items: { type: 'object', additionalProperties: false, required: ['t', 'preventedBy', 'text'], properties: { t: { type: 'integer' }, preventedBy: { type: 'string' }, text: { type: 'string' } } },
      },
      puzzle: {
        type: 'object',
        additionalProperties: false,
        required: ['prompt', 'plaintext', 'encoding', 'question', 'answer', 'accept'],
        properties: {
          prompt: { type: 'string' },
          plaintext: { type: 'string' },
          encoding: { type: 'string', enum: ['base64', 'hex', 'url', 'calldata', 'none'] },
          question: { type: 'string' },
          answer: { type: 'string' },
          accept: { type: 'array', items: { type: 'string' } },
        },
      },
      actions: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['id', 'label', 'correct', 'priority', 'feedback'],
          properties: { id: { type: 'string' }, label: { type: 'string' }, correct: { type: 'boolean' }, priority: { type: 'integer' }, feedback: { type: 'string' } },
        },
      },
      debrief: {
        type: 'object',
        additionalProperties: false,
        required: ['summary', 'attackerMethods', 'prevention', 'script', 'lessons'],
        properties: {
          summary: { type: 'string' },
          attackerMethods: { type: 'array', items: { type: 'string' } },
          prevention: { type: 'array', items: { type: 'string' } },
          script: { type: 'object', additionalProperties: false, required: ['lang', 'code', 'explain'], properties: { lang: { type: 'string' }, code: { type: 'string' }, explain: { type: 'string' } } },
          lessons: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  };

  const SCENARIO_RULES = [
    'You design realistic, fictional incident-response training scenarios for Code Ladder\'s "Critical Moment" simulator. The learner watches an attack unfold over a 300-second timer, must identify the attack type, decode one piece of evidence, and choose the right containment actions in the right order.',
    'The purpose is defensive: help the learner recognise attacker methods and stop them. Describe what the attacker does as observable evidence (log lines, network events, audit entries, wallet prompts), never as working attack code or step-by-step instructions.',
    'Use only fictional names. Every domain must end in .example; every IP address must come from 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24 or a private range. Never name real people. Real public incidents may be mentioned briefly in the debrief as history.',
    'Requirements:',
    '- events: 9 to 12, with t increasing from 0 to at most 290 seconds. src is a short lower-case tag such as email, browser, dns, network, auth, audit, api, git, ci, chain, mempool, wallet, social, hardware. Early events are subtle clues; later ones show escalating damage. Exactly one event text contains the literal placeholder {{evidence}} where the encoded evidence appears.',
    '- puzzle.plaintext is the decoded evidence (a header value, a URL, a JSON blob, a short message, or for calldata a 0x-prefixed hex string beginning with a common 4-byte selector such as 0x095ea7b3 approve, 0xa9059cbb transfer, 0x23b872dd transferFrom, 0xa22cb465 setApprovalForAll, 0xd505accf permit, 0xf2fde38b transferOwnership, 0x40c10f19 mint). The page encodes it itself using puzzle.encoding, so do not encode it yourself. puzzle.answer is short and must appear in the decoded plaintext (or be the function name for calldata). puzzle.accept lists other acceptable answers (may be empty).',
    '- attackTypes: 4 to 5 plausible options with short kebab-case ids; correctAttackType is one of those ids.',
    '- actions: 7 or 8. 4 or 5 are correct (correct true, priority 1, 2, 3... in the order a professional would do them, most urgent first); 2 or 3 are tempting mistakes (correct false, priority 0). Each feedback explains in one or two sentences why the action helps or hurts. Ids are short kebab-case.',
    '- escalations: 2 or 3, each with a t after the related clue appears, text describing the damage if the learner has not acted, and preventedBy set to the id of the correct action that stops it.',
    '- screen: what the learner sees on their virtual machine at the start (kind, window title, a URL or path, and 3 to 6 short lines).',
    '- debrief: a 3 to 5 sentence summary of what happened; 4 to 7 attackerMethods; 4 to 7 prevention steps; a short defensive script (detection, validation or hardening, 3 to 12 lines, language js, bash, yaml, solidity or text) with a one-sentence explanation; and lessons chosen only from the provided lesson ids.',
    'Pitch the difficulty at the requested level. Write in plain British English.',
  ].join('\n');

  function scenarioRequest(description, level, lessons) {
    return [
      `Learner's scenario request: ${description}`,
      `Difficulty: ${level}`,
      'Lesson ids you may reference in debrief.lessons:',
      lessons.map((l) => `${l.id}: ${l.title}`).join('\n'),
    ].join('\n\n');
  }

  g.CL_AI_PROMPTS = { COACH_RULES, SCENARIO_SCHEMA, SCENARIO_RULES, scenarioRequest };
})(typeof window !== 'undefined' ? window : globalThis);
