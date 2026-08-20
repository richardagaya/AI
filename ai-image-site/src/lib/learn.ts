/**
 * Content for learn.minsuroai.com.
 *
 * Lessons are plain data so the learn surface stays fully static. Anything
 * here that describes model behaviour is derived from `fal-models.ts` and
 * `fal.ts` — keep the two in step when the model registry changes.
 */

export type LessonLevel = "Beginner" | "Intermediate";

export type LessonBlock =
  | { kind: "text"; body: string }
  | { kind: "list"; items: string[] }
  | { kind: "prompt"; prompt: string; negative?: string; note?: string }
  | { kind: "callout"; title: string; body: string };

export type LessonSection = {
  heading: string;
  blocks: LessonBlock[];
};

export type Lesson = {
  slug: string;
  title: string;
  summary: string;
  level: LessonLevel;
  minutes: number;
  track: string;
  sections: LessonSection[];
  takeaways: string[];
};

export const TRACKS = [
  {
    name: "Foundations",
    description: "How a prompt is read, and what the model does with it.",
  },
  {
    name: "Craft",
    description: "Framing, references and the controls that shape a result.",
  },
  {
    name: "Workflow",
    description: "Choosing models and spending credits without wasting them.",
  },
] as const;

export const LESSONS: Lesson[] = [
  {
    slug: "prompt-anatomy",
    title: "The anatomy of a prompt that works",
    summary:
      "Four parts, in a deliberate order. Most weak results are a missing part rather than a missing keyword.",
    level: "Beginner",
    minutes: 6,
    track: "Foundations",
    sections: [
      {
        heading: "Four parts, in order",
        blocks: [
          {
            kind: "text",
            body: "A prompt is not a search query. You are describing a photograph or painting that does not exist yet, and the model fills every gap you leave. The reliable structure is subject, then action, then setting, then treatment.",
          },
          {
            kind: "list",
            items: [
              "Subject — who or what the frame is about, with the two or three details that make it specific.",
              "Action or pose — what they are doing, and where they are looking.",
              "Setting and light — where this happens and what is lighting it.",
              "Treatment — medium, lens, palette, and the style you want it rendered in.",
            ],
          },
          {
            kind: "prompt",
            prompt:
              "A silver-haired sorceress in a frost-rimed cloak, turning to look back over her shoulder, standing on a frozen lake at dusk, low sun behind her throwing long shadows across the ice, painterly digital illustration, cool blue palette with a single warm rim light",
            note: "Each clause answers one of the four parts. Nothing is decorative.",
          },
        ],
      },
      {
        heading: "Front-load what matters",
        blocks: [
          {
            kind: "text",
            body: "Words near the start of a prompt carry more weight than words near the end. If the subject appears in the twelfth clause, after a long preamble about lighting and lens, expect the subject to drift. Put the thing you would be most annoyed to lose first.",
          },
          {
            kind: "text",
            body: "This also means long prompts are not automatically better. Past roughly sixty words most models start averaging your requests together instead of honouring each one. If a detail is not load-bearing, cut it and spend the attention elsewhere.",
          },
        ],
      },
      {
        heading: "Describe light, not quality",
        blocks: [
          {
            kind: "text",
            body: "Words like masterpiece, 8k and highly detailed were useful on older models trained on tagged image boards. Current models are trained on captions written in ordinary language, so those tokens mostly add noise. Lighting is the substitute that actually changes the image.",
          },
          {
            kind: "list",
            items: [
              "Instead of cinematic, say low key with a single hard light from camera left.",
              "Instead of highly detailed, name the texture you want: wet cobblestone, brushed steel, loose watercolour bleed.",
              "Instead of professional photo, name the lens: shot on 85mm at f/1.8, shallow depth of field.",
            ],
          },
          {
            kind: "callout",
            title: "Change one thing at a time",
            body: "When a render is close but wrong, resist rewriting the prompt. Adjust a single clause and run it again. Rewrites tell you nothing about which word was responsible.",
          },
        ],
      },
    ],
    takeaways: [
      "Cover subject, action, setting and treatment — a missing part is a gap the model fills for you.",
      "Put the most important detail first; attention thins out toward the end.",
      "Replace quality adjectives with concrete descriptions of light, texture and lens.",
    ],
  },

  {
    slug: "negative-prompts",
    title: "Negative prompts, and when they do nothing",
    summary:
      "Only some models on minsuro accept a negative prompt. Knowing which ones saves you from debugging a field that was never sent.",
    level: "Beginner",
    minutes: 5,
    track: "Foundations",
    sections: [
      {
        heading: "What a negative prompt is",
        blocks: [
          {
            kind: "text",
            body: "A negative prompt is a second list of concepts that the model steers away from while it renders. It is not a filter applied afterwards and it is not a guarantee. It biases the result, in the same way the main prompt does, just in the opposite direction.",
          },
        ],
      },
      {
        heading: "Which models actually receive it",
        blocks: [
          {
            kind: "text",
            body: "This is the part that surprises people. The studio shows one negative prompt field for every model, but most of the endpoints behind it do not take that parameter. When a model does not support it, the text is dropped before the request is sent — silently, with no error.",
          },
          {
            kind: "list",
            items: [
              "Images — only Qwen Image accepts a negative prompt.",
              "Video — Veo 3.1, Veo 3.1 Fast and Wan 2.7 accept one.",
              "Everything else — FLUX, Nano Banana, Imagen, Seedream, GPT Image, Grok, Kling, Seedance, Hailuo — ignores the field entirely.",
            ],
          },
          {
            kind: "callout",
            title: "If the field is ignored, say it in the prompt",
            body: "On a model without negative prompt support, the only lever is the positive prompt. Rather than a negative of blurry, write sharp throughout with the whole subject in focus. Describe what you want present, not what you want absent.",
          },
        ],
      },
      {
        heading: "Writing one that helps",
        blocks: [
          {
            kind: "text",
            body: "On the models that do support it, keep the negative short and concrete. A fifty-item list of every failure mode you have ever seen will flatten the image, because you are pushing the model away from a large and vaguely defined region at once.",
          },
          {
            kind: "prompt",
            prompt:
              "Weathered lighthouse on a basalt cliff, storm rolling in, spray catching the last light, moody oil painting",
            negative: "blurry, low contrast, watermark, text, extra hands",
            note: "Five specific terms. Add more only when you have seen the failure it targets.",
          },
        ],
      },
    ],
    takeaways: [
      "Only Qwen Image accepts a negative prompt for stills; Veo 3.1, Veo 3.1 Fast and Wan 2.7 accept one for video.",
      "Unsupported models drop the field silently — nothing in the result tells you it was ignored.",
      "Keep negatives to a handful of concrete terms, and prefer stating the positive instead.",
    ],
  },

  {
    slug: "choosing-a-model",
    title: "Picking the right model for the job",
    summary:
      "Twelve image models and twelve video models, costing one to sixteen credits. The cheap one is often the correct one.",
    level: "Beginner",
    minutes: 8,
    track: "Workflow",
    sections: [
      {
        heading: "Draft cheap, finish expensive",
        blocks: [
          {
            kind: "text",
            body: "Image models on minsuro range from one credit to seven. That spread is the single biggest lever you have on cost, and the right habit is to separate exploration from production. Explore on the cheapest model that understands your prompt, then re-run the prompt you settled on through a better one.",
          },
          {
            kind: "list",
            items: [
              "FLUX Schnell, 1 credit — the drafting model. Fast, no image input, good enough to tell you whether a composition works.",
              "Grok Imagine and Qwen Image, 2 credits — a step up, and Qwen is the only still model that takes a negative prompt.",
              "FLUX Dev, 2 credits — the cheapest model that accepts a reference image, at 3 credits with one attached.",
              "Imagen 4 and Seedream 4.5, 3 credits — photoreal and general-purpose finishing.",
              "FLUX 2 Pro and GPT Image, 4 to 5 credits — frontier stills when the frame is going to be seen.",
              "Nano Banana Pro, 6 credits — highest quality of the Gemini family, and 7 with an image attached.",
            ],
          },
        ],
      },
      {
        heading: "Not every model takes a reference image",
        blocks: [
          {
            kind: "text",
            body: "Attaching a reference to a model with no image endpoint does not fail loudly — the studio simply runs the text-to-image path and your reference has no effect. Before you upload, check that the model supports it.",
          },
          {
            kind: "list",
            items: [
              "Accept an image — FLUX Dev, Nano Banana, Nano Banana 2, Nano Banana Pro, Seedream 4.5, Seedream 5.0 and 5.0 Lite.",
              "Text only — FLUX Schnell, FLUX 2 Pro, Imagen 4, GPT Image, Grok Imagine, Qwen Image.",
            ],
          },
          {
            kind: "callout",
            title: "Editing an existing image",
            body: "For changing something in a picture you already have, the Nano Banana and Seedream families are built around edit endpoints and tend to preserve the rest of the frame. FLUX Dev re-renders the whole image guided by yours, which is a different job.",
          },
        ],
      },
      {
        heading: "Video costs an order of magnitude more",
        blocks: [
          {
            kind: "text",
            body: "Video runs from 8 to 16 credits per clip, so the drafting habit matters more here, not less. Settle the subject, framing and lighting as a still first — that costs one credit on FLUX Schnell — and only then describe the motion.",
          },
          {
            kind: "list",
            items: [
              "Kling O3, Hailuo 2.3, Wan 2.7 and Grok Imagine, 8 credits — the working tier.",
              "Gemini Omni Flash, Seedance 2.0 and Happy Horse, 10 credits — physics, director control and lip sync respectively.",
              "Kling O3 Pro and Veo 3.1 Fast, 12 credits; Seedance 2.5 and FLUX 3, 14; Veo 3.1, 16.",
            ],
          },
          {
            kind: "text",
            body: "Clip length is picked per model, generally between four and ten seconds. If you choose a duration a model does not offer, the studio snaps it to the nearest one that model supports rather than rejecting the job.",
          },
        ],
      },
    ],
    takeaways: [
      "Draft on FLUX Schnell at 1 credit, then re-run the winning prompt on a finishing model.",
      "Six of the twelve image models ignore an uploaded reference — check before you attach one.",
      "Resolve composition as a still before spending 8 to 16 credits on a video clip.",
    ],
  },

  {
    slug: "framing-and-aspect",
    title: "Framing, aspect ratio and where the eye lands",
    summary:
      "Aspect ratio is a compositional decision the model reads, not a crop applied at the end.",
    level: "Intermediate",
    minutes: 6,
    track: "Craft",
    sections: [
      {
        heading: "The ratio changes the picture",
        blocks: [
          {
            kind: "text",
            body: "Aspect ratio is passed to the model before it renders, so it shapes what gets generated rather than trimming it afterwards. The same prompt at 2:3 and at 16:9 produces genuinely different images: the portrait fills the height with the subject, the widescreen version invents environment on either side to fill the space.",
          },
          {
            kind: "list",
            items: [
              "2:3 — single figures, portraits, anything where height is the subject.",
              "1:1 — objects, icons, tight character studies with no environment to justify.",
              "3:2 — the default photographic frame; a subject with room to breathe.",
              "16:9 and 21:9 — landscapes and establishing shots. Expect the model to invent scenery.",
              "9:16 — vertical video and phone-first stills.",
            ],
          },
          {
            kind: "callout",
            title: "Ratios are clamped, not rejected",
            body: "Models support different ratio sets. Ask for 21:9 on a still and the studio falls back to the closest ratio that model offers, so it is worth choosing from what the model actually supports.",
          },
        ],
      },
      {
        heading: "Say where the camera is",
        blocks: [
          {
            kind: "text",
            body: "Without a stated shot distance most models default to a mid shot, roughly waist up, subject centred. If you want anything else you have to ask. Shot distance and camera height are two short clauses that do more for a composition than any amount of style vocabulary.",
          },
          {
            kind: "prompt",
            prompt:
              "Close-up of a weathered cartographer's hands pinning a chart to a table, shot from just above the table surface, lantern light raking across the paper, shallow depth of field, 85mm",
            note: "Shot distance, camera height, light direction and lens — four clauses, one clear image.",
          },
        ],
      },
      {
        heading: "Motion in video is prompt text",
        blocks: [
          {
            kind: "text",
            body: "The camera control in the video composer is not a separate parameter the model receives. The studio appends it to your prompt as a sentence, which means you can write the same instruction yourself and be more precise than the preset list allows.",
          },
          {
            kind: "text",
            body: "Describe one movement per clip. A prompt that asks for a slow push in, a pan left and a rack focus in five seconds will usually produce none of them cleanly.",
          },
        ],
      },
    ],
    takeaways: [
      "Aspect ratio is sent before rendering, so it changes the composition rather than cropping it.",
      "State shot distance and camera height explicitly or you will get a centred mid shot.",
      "Camera movement is appended to the video prompt as text — write it yourself for more control.",
    ],
  },

  {
    slug: "image-to-image",
    title: "Image to image: steering instead of starting over",
    summary:
      "How a reference is used depends on the model family, and the strength control only exists for one of them.",
    level: "Intermediate",
    minutes: 8,
    track: "Craft",
    sections: [
      {
        heading: "Two different behaviours",
        blocks: [
          {
            kind: "text",
            body: "The studio calls it image to image, but the models behind it do two distinct things with your upload, and knowing which one you are using explains most surprising results.",
          },
          {
            kind: "list",
            items: [
              "FLUX Dev re-renders from scratch, using your image as a starting point. Composition and colour carry over; fine detail does not.",
              "Nano Banana and Seedream treat your upload as an image to edit. They aim to preserve the frame and change what you asked for.",
            ],
          },
          {
            kind: "text",
            body: "So to move a character into a different setting, FLUX Dev is the right tool. To recolour a jacket and leave the rest untouched, an edit model is.",
          },
        ],
      },
      {
        heading: "Strength applies to FLUX only",
        blocks: [
          {
            kind: "text",
            body: "The strength control decides how far the render is allowed to travel from your reference, on a scale from just above zero to one. It is only sent to the FLUX family. On Nano Banana and Seedream the value is not part of the request at all, and moving the slider changes nothing.",
          },
          {
            kind: "list",
            items: [
              "0.2 to 0.4 — a pass over the original. Lighting and materials shift, structure holds.",
              "0.5 to 0.7 — the usual working range. Recognisably your composition, freshly rendered.",
              "0.8 and above — the reference becomes a loose suggestion. This is the default, at 0.8.",
            ],
          },
          {
            kind: "callout",
            title: "Losing your composition?",
            body: "Bring strength down before you rewrite the prompt. A high strength value overrides careful prompting, and it is the most common reason an image-to-image render ignores the reference.",
          },
        ],
      },
      {
        heading: "The prompt still has to describe the whole image",
        blocks: [
          {
            kind: "text",
            body: "A reference image does not replace the prompt. On a re-render model the prompt describes the finished picture, not the change you want — writing only make it snowing gives the model almost nothing to work from, and it will drift.",
          },
          {
            kind: "prompt",
            prompt:
              "The same lighthouse on its basalt cliff, now in heavy snowfall, flat grey afternoon light, snow accumulating on the railings, muted palette",
            note: "Restates the subject, then the change. Edit models are more forgiving here, but this phrasing works on both.",
          },
        ],
      },
    ],
    takeaways: [
      "FLUX Dev re-renders from your reference; Nano Banana and Seedream edit it in place.",
      "Strength is only sent to FLUX models — on the others the slider has no effect.",
      "Describe the whole finished image, not just the change you want.",
    ],
  },

  {
    slug: "credits-and-iteration",
    title: "Spending credits like a professional",
    summary:
      "Credits are taken when the job is created and refunded by never being charged when it fails. Here is how to waste fewer of them.",
    level: "Beginner",
    minutes: 5,
    track: "Workflow",
    sections: [
      {
        heading: "When you are charged",
        blocks: [
          {
            kind: "text",
            body: "The cost of a render is deducted in the same transaction that creates the job, so a generation can never start without being paid for. If the job fails, no credits are consumed. You are charged for work attempted, not for results you liked.",
          },
          {
            kind: "text",
            body: "Cost depends on the model and on whether you attached a reference image, ranging from one credit for a FLUX Schnell still to sixteen for a Veo 3.1 clip. The composer shows the price before you submit — it is worth reading it.",
          },
        ],
      },
      {
        heading: "A cheaper loop",
        blocks: [
          {
            kind: "list",
            items: [
              "Draft the composition on FLUX Schnell at 1 credit until the framing is right.",
              "Change one clause per run so you learn which word did the work.",
              "Move to a finishing model only once the prompt is settled.",
              "For video, lock the frame as a still first — a bad 12 credit clip is twelve bad drafts.",
            ],
          },
          {
            kind: "callout",
            title: "Keep the prompts that worked",
            body: "Your library stores the prompt alongside every render. Re-running a known-good prompt with one clause swapped is consistently cheaper than writing a new one from memory.",
          },
        ],
      },
      {
        heading: "When a render is refused",
        blocks: [
          {
            kind: "text",
            body: "Some models run a provider-side safety check that minsuro does not control, and a refusal there comes back as a content policy error. That is the model declining, not the platform filtering you. Switching to a different model family is usually the fastest route around it.",
          },
          {
            kind: "text",
            body: "Refused and failed jobs alike cost nothing, so retrying elsewhere is free apart from your time.",
          },
        ],
      },
    ],
    takeaways: [
      "Credits are deducted when the job is created, and failed jobs never consume them.",
      "Draft at 1 credit and change one clause at a time before moving to a finishing model.",
      "A content policy error is the model refusing, not minsuro — try another family.",
    ],
  },
];

export function getLesson(slug: string): Lesson | undefined {
  return LESSONS.find((l) => l.slug === slug);
}

export function lessonsByTrack(): Array<{ track: string; description: string; lessons: Lesson[] }> {
  return TRACKS.map((t) => ({
    track: t.name,
    description: t.description,
    lessons: LESSONS.filter((l) => l.track === t.name),
  })).filter((g) => g.lessons.length > 0);
}

/** Reading order across the whole curriculum, used for prev/next links. */
export function lessonNeighbours(slug: string): {
  previous: Lesson | null;
  next: Lesson | null;
} {
  const ordered = lessonsByTrack().flatMap((g) => g.lessons);
  const index = ordered.findIndex((l) => l.slug === slug);
  return {
    previous: index > 0 ? ordered[index - 1] : null,
    next: index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : null,
  };
}
