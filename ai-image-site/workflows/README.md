Put your ComfyUI API workflows here.

This app loads:
- `workflows/text2img.json`
- `workflows/img2img.json`

Both are treated as **string templates**. You can include placeholders:
- `__PROMPT__`
- `__NEGATIVE_PROMPT__`
- `__INPUT_IMAGE__` (for img2img; should be the ComfyUI *input* image name)

Recommended setup:
1. In ComfyUI, build a workflow that works.
2. Use a workflow-to-API export (ComfyUI “Save (API Format)” / “Export API”).
3. Replace your prompt fields in the JSON with the placeholders above.

If your workflow needs additional dynamic values (steps, cfg, seed, width/height),
we can extend the templating logic.

