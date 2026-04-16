---
title: Code Cleansing Prompt
date: 2026-04-15
---

<span class="video-note" style="margin-left:0;"><a href="https://x.com/shawmakesmagic/status/2044269097647779990?s=20" target="_blank">[ Source Article ]</a></span>

<br>

<div class="prompt-block">
<div class="prompt-indicator">Prompt</div>
<button class="copy-prompt-btn" onclick="copyPrompt(this)" title="Copy Email">
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z"></path></svg>
</button>
<div class="prompt-text">I want to clean up my codebase and improve code quality. This is a complex task, so we'll need 8 subagents. Make a sub agent for each of the following:
1. Deduplicate and consolidate all code, and implement DRY where it reduces complexity
2. Find all type definitions and consolidate any that should be shared
3. Use tools like knip to find all unused code and remove, ensuring that it's actually not referenced anywhere
4. Untangle any circular dependencies, using tools like madge
5. Remove any weak types, for example 'unknown' and 'any' (and the equivalent in other languages), research what the types should be, research in the codebase and related packages to make sure that the replacements are strong types and there are no type issues
6. Remove all try catch and equivalent defensive programming if it doesn't serve a specific role of handling unknown or unsanitized input or otherwise has a reason to be there, with clear error handling and no error hiding or fallback patterns
7. Find any deprecated, legacy or fallback code, remove, and make sure all code paths are clean, concise and as singular as possible
8. Find any AI slop, stubs, larp, unnecessary comments and remove. Any comments that describe in-motion work, replacements of previous work with new work, or otherwise are not helpful should be either removed or replaced with helpful comments for a new user trying to understand the codebase-- but if you do edit, be concise
</div></div>