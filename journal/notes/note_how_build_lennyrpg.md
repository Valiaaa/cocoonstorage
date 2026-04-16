---
title: Note: How I built LennyRPG
date: 2026-04-15
---

<span class="video-note" style="margin-left:0;"><a href="https://www.lennysnewsletter.com/p/how-i-built-lennyrpg" target="_blank">[ Source Article ]</a></span>

## product building flow
<ol>
    <li><span class="list-item-spaced"><b>Core idea:</b> clarify what the app is, and create sketches (collages) for visually heavy projects.</li></span>
    <li><span class="list-item-spaced"><b>Product requirement document (PRD):</b> it determines how smooth the product build will be. AI interviewing is an easy way to prepare for it.<br>
    
<div class="prompt-block">
<div class="prompt-indicator">Prompt Used</div>
<button class="copy-prompt-btn" onclick="copyPrompt(this)" title="Copy Prompt">
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z"></path></svg>
</button>
<div class="prompt-text">Ask me questions to help you put together a brief PRD for the following web game: I want to create a mini game that takes all the podcast episodes from Lenny’s Podcast, generates questions from each episode, and make it like a Pokémon RPG game, with similar visuals. What I am expecting is, for example, you found Elena in the wild, and you can compete with Elena on product questions, you get 5 questions, and you lose HP [hit points] when you lose the answer etc. We can randomly pick 50 guests from the podcast and get challenged. The entire theme/design of the game needs to be very Pokémon RPG style in the old day.</div>
</div>
</li></span>
    <li><span class="list-item-spaced"><b>Core functionality prototype</b> as a proof of concept</li></span>
    <ol>
        <li><span class="list-item-spaced"><b>Open-source projects searching:</b> Ask Claude Code to search for ready-made open source libraries will help speeding up initiating the product build.</li></span>
        <li><span class="list-item-spaced"><b>Working with complex libraries:</b> It might take some time for your ai agent to understand how some libraries work. To help, you can create a Markdown file for your agent to record all the action logs, so it understands better what works and what doesn’t.</li></span>
        <li><span class="list-item-spaced"><b>Initial testing:</b> See people's first reaction: is it easy to understand and use? What's the main emotional response when using the product?</li></span>
    </ol>
    <li><span class="list-item-spaced"><b>Remaining Features</b> to finish the end-to-end flow</li></span>
    <ol>
        <li><span class="list-item-spaced"><b>Custom CLI tool:</b> Ask your ai agent to build custom CLI tools to reduce repetitive work</li></span>
    
<div class="prompt-block">
<div class="prompt-indicator">Prompt Used</div>
<button class="copy-prompt-btn" onclick="copyPrompt(this)" title="Copy Prompt">
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z"></path></svg>
</button>
<div class="prompt-text">Create a CLI command tool that creates a simple way to read through all the transcripts in /transcript folder one by one, and for each, generate 5 questions following the requirements and JSON format: {Your requirements and JSON format}</div>
</div>
    <li><span class="list-item-spaced"><b>Database setup:</b> setting up Supabase MCP in Claude Code<br>
    <div class="prompt-block">
<div class="prompt-indicator">Prompt Used</div>
<button class="copy-prompt-btn" onclick="copyPrompt(this)" title="Copy Prompt">
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z"></path></svg>
</button>
<div class="prompt-text">I have now connected with Supabase MCP. Please help me to set up the rest so that user can see leaderboard from all around the world safely. As this will be an open source project, make sure we don't expose any dangerous key etc in github</div>
</div>
    </li></span>
    </ol>
    <li><span class="list-item-spaced"><b>Polish and final code review</b></li></span>
    <ol>
    <li><span class="list-item-spaced"><b>QA check with Claude Skills:</b> use the review skill from <a href="https://github.com/ComposioHQ/awesome-claude-skills?tab=readme-ov-file" target="_blank">Awesome Skills marketplace</a> to review the entire codebase comprehensively</li></span>   
    <li><span class="list-item-spaced"><b>SEO:</b>  page title, meta description, social preview, and basic indexing setup</li></span> 
    </ol>
    <li><span class="list-item-spaced"><b>Ship it</b></li></span>

</ol>

## used tool/platform

- <b>Ideation and planning:</b> <a href="https://miro.com/" target="_blank">Miro</a>, <a href="https://chatgpt.com/" target="_blank">ChatGPT</a>
- <b>Coding:</b> 
    - <a href="https://claude.com/" target="_blank"><b>Claude Code</a>: Lead engineer</b> - searching for solutions and open source libraries, implementation plan, product architecture, reason about product and design constraints
    - <a href="https://chatgpt.com/codex/" target="_blank"><b>Codex</a>: Main executor</b>: good at following instructions
    - <a href="https://cursor.com/" target="_blank"><b>Cursor</a>: Smaller tasks</b> like formatting documents, JSON files, or writing simple scripts
- <b>Image generation:</b> GPT Image Gen (gpt-image-1.5)
- <b>Quiz generation:</b> GPT-4o
- <b>Music & sound:</b> <a href="https://opengameart.org/" target="_blank">OpenGameArt.org</a>
- <b>Database:</b> <a href="https://supabase.com/" target="_blank">Supabase</a>
- <b>Game engine:</b> <a href="https://phaser.io/tutorials/getting-started-phaser3" target="_blank">Phaser 3</a>
- <b>Deployment:</b> <a href="https://vercel.com/home" target="_blank">Vercel</a>