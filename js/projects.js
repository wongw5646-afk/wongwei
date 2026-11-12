/* =========================================================
   ALL PORTFOLIO CONTENT LIVES HERE.
   Edit this file and every page updates automatically.

   Each project:
     id          short name used in the link (project.html?p=id)
     page        optional: a hand-made page to open instead, e.g. "fifi.html"
     title       project name
     tagline     one line shown on the landing page card
     summary     one or two sentences at the top of the project page
     status      "finished" or "growing" (shows a sprout badge)
     folder      where its web images live
     hero        big image at the top of the project page
     thumb       small image for cards (cropped to a square by CSS)
     thumbFocus  which part of the thumb stays visible, e.g. "50% 30%"
                 (first number = left/right, second = up/down)
     color       colour of this project's worm on the home page
     stages      the process, in order. Each stage:
        name     bubble label
        notes    2-4 sentences (leave "" to show "coming soon")
        versions true = label the images v1, v2, v3...
        compare  optional before/after slider: { before, after, beforeLabel, afterLabel }
        images   list of { src, caption, alt }  (alt defaults to caption)

   NOTE: text marked "Draft" is a placeholder written from the photos.
   Replace it with your own words.
   ========================================================= */

window.PROJECTS = [
  {
    id: "whiddi",
    page: "whiddi.html",   // this project has its own hand-made page
    title: "Whiddi",
    tagline: "A pot clip that sings when the water boils.",
    summary:
      "Draft: A little red clip for a partially sighted young cook. Steam travels up a channel inside its body and comes out as a whistle, so you can hear when the pasta water is ready.",
    status: "finished",
    folder: "images-web/whiddi/",
    hero: "screenshot-2026-08-24-at-11-26-13-pm.jpg",
    heroAlt: "Render of the red Whiddi clip on the rim of a steaming pot with a glass lid",
    thumb: "card-whiddi-pot.jpg",   // Whiddi clipped on the pot (card copy with a bit more room on the right)
    thumbFocus: "50% 50%",
    color: "#E5533D",   // red worm on the home page
    stages: [
      {
        name: "Research",
        notes:
          "Draft: My partner and I made pasta while wearing glasses smeared with glue, to feel what cooking is like with very little vision. We mapped every step and marked the hard ones in pink. Waiting for the water to boil and turning off the stove were the trickiest moments.",
        images: [
          { src: "screenshot-2026-11-08-at-5-42-59-pm.jpg", caption: "Task analysis: every step of making pasta, with the difficult ones highlighted." }
        ]
      },
      {
        name: "Sketches",
        notes:
          "Draft: I sketched lots of directions: timers, dials, sensors, portion containers and pot clips. One question stuck: what would steam sound like if it travelled through an octopus's singing legs?",
        images: [
          { src: "untitled-artwork.jpg", caption: "First ideation sheet: dials, timers, containers and a singing octopus." },
          { src: "screenshot-2026-11-08-at-5-44-37-pm.jpg", caption: "Close-up: dial and sensor ideas." },
          { src: "screenshot-2026-11-08-at-5-44-47-pm.jpg", caption: "Close-up: stacking portion containers." }
        ]
      },
      {
        name: "Concepts",
        notes:
          "Draft: I modelled ten quick ways a product could hold onto a pot: clips, lids, cages and rim hooks. The rim clip was the simplest for someone to place by touch.",
        images: [
          { src: "screenshot-2026-10-03-at-2-17-38-pm.jpg", caption: "Ten ways to attach to a pot." }
        ]
      },
      {
        name: "Models",
        versions: true,
        notes:
          "Draft: I printed and carved study models to test the clip, the whistle and the character's profile. Each version got a little friendlier and easier to grip.",
        images: [
          { src: "img-2346.jpg", caption: "Rim clip with a curly creature on top." },
          { src: "img-2345.jpg", caption: "Whistle bulb with finger grips." },
          { src: "img-2347.jpg", caption: "Rounded whistle body." },
          { src: "img-2367.jpg", caption: "Flat profile study." },
          { src: "img-2361.jpg", caption: "Clip with a tail hook." },
          { src: "fullsizerender.jpg", caption: "Refined character with an eye and a smile." }
        ]
      },
      {
        name: "How it works",
        notes:
          "Draft: Inside, a channel carries steam from the pot up through the body to the whistle at the mouth. The two halves were printed separately and joined.",
        images: [
          { src: "screenshot-2026-10-02-at-9-29-56-am.jpg", caption: "Cutaway showing the steam channel inside." },
          { src: "img-2494.jpg", caption: "The two printed halves, opened up." },
          { src: "screenshot-2026-10-05-at-12-59-49-pm.jpg", caption: "Final form, rendered." }
        ]
      },
      {
        name: "Final design",
        notes:
          "Draft: Clip Whiddi onto the pot, wait, and it sings when the water is boiling. No reading, no timers, just a sound you can't miss.",
        images: [
          { src: "dd.jpg", caption: "Whiddi in hand." },
          { src: "untitled-artwork-2.jpg", caption: "Storyboard: clip it on, and it whistles when the water boils." },
          { src: "screenshot-2026-08-24-at-11-26-13-pm.jpg", caption: "On a pot with a glass lid." },
          { src: "screenshot-2026-08-24-at-9-53-59-pm.jpg", caption: "On an open pot." },
          { src: "screenshot-2026-08-24-at-9-59-34-pm.jpg", caption: "Side view: how it hooks over the rim." }
        ]
      }
    ]
  },

  {
    id: "tooth-fairy",
    page: "fifi.html",   // this project has its own hand-made page
    title: "FIFI",
    tagline: "A tooth fairy keepsake for lost teeth and big memories.",
    summary:
      "Draft: A nightstand keepsake where a child leaves a lost tooth for the Tooth Fairy. It's about time and memory: little drawers keep each tooth and the moments that go with it.",
    status: "finished",
    folder: "images-web/tooth-fairy/",
    hero: "toothyyyy-3.jpg",
    heroAlt: "Render of a white winged tooth sitting on a round red base with drawers",
    thumb: "toothyyyy-3.jpg",
    leaf: "leaf-fifi.jpg",          // square copy for the diamond leaf on the home tree
    thumbFocus: "50% 50%",
    color: "#F2C230",   // yellow worm on the home page
    stages: [
      {
        name: "Sketches",
        notes:
          "Draft: I started by drawing anything that felt like growing up: school buses, butterflies, crowns, combs and jaws. Then I narrowed in on teeth with fairy wings and a base with drawers.",
        images: [
          { src: "screenshot-2026-02-01-at-2-59-27-pm.jpg", caption: "First sketches: buses, cars and gingerbread friends." },
          { src: "screenshot-2026-02-01-at-2-59-36-pm.jpg", caption: "Butterflies, trophies, bones and keepsakes." },
          { src: "screenshot-2026-02-03-at-4-01-00-pm.jpg", caption: "Tooth characters on drawer bases (sketched sideways)." },
          { src: "sketch-final-2.jpg", caption: "Thumbnails of jaws, wings and hanging forms." }
        ]
      },
      {
        name: "Concepts",
        notes:
          "Draft: I drew two directions in orthographic views: a winged tooth on a drawer base, and a crowned fairy-tent shape. The winged tooth felt warmer and more like a character.",
        images: [
          { src: "tooth1.jpg", caption: "Concept A: winged tooth on a drawer base." },
          { src: "tooth2.jpg", caption: "Concept B: crowned fairy tent." }
        ]
      },
      {
        name: "Models",
        versions: true,
        notes:
          "Draft: Foam models helped me get the proportions and drawers right. The base turns, and the drawers slide out to hold each tooth.",
        images: [
          { src: "img-0039.jpg", caption: "Early foam study with a chunky base." },
          { src: "img-0040.jpg", caption: "Early foam study, side view." },
          { src: "fullsizerender.jpg", caption: "Refined foam tooth on its drawer base." },
          { src: "fullsizerender-3.jpg", caption: "The tooth on its own." },
          { src: "fullsizerender-2.jpg", caption: "Base with the turning plate." },
          { src: "fullsizerender-4.jpg", caption: "Drawers open." }
        ]
      },
      {
        name: "Final design",
        notes:
          "Draft: Drop the tooth through the slot, turn the base, and go to sleep. By morning the Tooth Fairy has visited, and the tooth is kept safe in its own little drawer.",
        compare: {
          before: "fullsizerender.jpg",
          after: "toothyyyy-3.jpg",
          beforeLabel: "foam",
          afterLabel: "final"
        },
        images: [
          { src: "toothyyyy-3.jpg", caption: "Final render." },
          { src: "toothy-2-0-8.jpg", caption: "Exploded view: tooth, turning plate and drawer base." },
          { src: "untitled-artwork-4.jpg", caption: "Storyboard: drop the tooth in, turn, sleep." }
        ]
      }
    ]
  },

  {
    id: "vessel",
    title: "Vessel",
    tagline: "A paper lantern that fills modern homes with soft, warm light.",
    summary:
      "Draft: A paper lantern made to bring soft, warm light into modern homes.",
    status: "finished",
    folder: "images-web/vessel/",
    page: "vessel.html",
    hero: "20e561e8-2dbf-499f-8d39-2b810354ec3e.jpg",
    heroAlt: "White paper vessel made of interlocking folded frames",
    thumb: "card-vessel-render.jpg",   // final render, zoomed in on the lamp for the round card
    thumbFocus: "50% 50%",
    color: "#4FAE5A",   // green worm on the home page
    stages: [
      {
        name: "Sketches",
        notes:
          "Draft: I drew star, wave, box and cross shapes, thinking about how each one could fold up from a single flat sheet.",
        images: [
          { src: "screenshot-2026-10-01-at-8-27-09-pm.jpg", caption: "Star-petal vessel." },
          { src: "screenshot-2026-10-01-at-8-29-16-pm.jpg", caption: "Star from above, with legs." },
          { src: "screenshot-2026-10-01-at-8-32-24-pm.jpg", caption: "Wavy bowl." },
          { src: "screenshot-2026-10-01-at-8-36-02-pm.jpg", caption: "Wave base with folded tabs." },
          { src: "screenshot-2026-10-01-at-8-40-31-pm.jpg", caption: "Tall vessel with a diamond window." },
          { src: "screenshot-2026-10-01-at-8-45-22-pm.jpg", caption: "Box with swinging side panels." },
          { src: "screenshot-2026-10-01-at-8-48-34-pm.jpg", caption: "Bow-tie wings on a skirt." },
          { src: "screenshot-2026-10-01-at-8-55-18-pm.jpg", caption: "Hexagon collar with legs." },
          { src: "screenshot-2026-10-01-at-8-57-21-pm.jpg", caption: "Cross shape opening around a centre." }
        ]
      },
      {
        name: "Paper models",
        versions: true,
        notes:
          "Draft: I built the sketches in paper. Some folds held their shape, and some collapsed, which taught me where a vessel needs structure.",
        images: [
          { src: "4faeaa75-e74f-4f30-a3ac-dcc6fbe96842.jpg", caption: "Petal box with tissue bloom." },
          { src: "img-4133.jpg", caption: "Triangular folded planes." },
          { src: "img-4132.jpg", caption: "Spiral petals." },
          { src: "img-4134.jpg", caption: "Arching strips." },
          { src: "img-4117.jpg", caption: "Wrapped folded pouch." },
          { src: "img-4131.jpg", caption: "Tall vessel with a diamond window." },
          { src: "img-4130.jpg", caption: "Stacked boxes." },
          { src: "screenshot-2026-10-01-at-9-23-35-pm.jpg", caption: "Cross-shaped frame vessel." }
        ]
      },
      {
        name: "Final model",
        notes:
          "Draft: The final vessel combines interlocking frames into one form that reads differently from every side.",
        images: [
          { src: "20e561e8-2dbf-499f-8d39-2b810354ec3e.jpg", caption: "Final paper vessel." }
        ]
      }
    ]
  },

  {
    id: "dugong",
    page: "dugong.html",   // this project has its own hand-made page
    title: "Dugong Puzzle",
    tagline: "Animals hiding inside animals, in wood.",
    summary:
      "Draft: A wooden puzzle where smaller animals nest inside a bigger one. It started with animal drawings and ended as a hand-stained dugong.",
    status: "finished",
    folder: "images-web/dugong/",
    hero: "leaf-dugong.jpg",        // turned 90 degrees left (original: img-1654.jpg)
    heroAlt: "Hand-stained wooden puzzle of a purple dugong with blue, green and yellow pieces",
    thumb: "leaf-dugong.jpg",
    leaf: "leaf-dugong-hero.jpg",   // turned 90 degrees left and cropped close to the puzzle, for the wide pill leaf
    leafFocus: "50% 20%",           // where the leaf picture sits: 2nd number 0% = show the top, 100% = show the bottom
    thumbFocus: "85% 50%",          /* 1st number: bigger = show more of the right side (the purple head) */
    color: "#4A90E2",   // blue worm on the home page
    stages: [
      {
        name: "Outlines",
        notes:
          "Draft: I drew outline after outline, looking for animals that could curl around each other and still lock together as puzzle pieces.",
        images: [
          { src: "img-1334.jpg", caption: "Nested animal outlines." },
          { src: "img-1336.jpg", caption: "A playful leopard outline." },
          { src: "img-1339.jpg", caption: "Cat and cub nesting shapes." },
          { src: "img-1340.jpg", caption: "First dugong shape." }
        ]
      },
      {
        name: "Animal studies",
        notes:
          "Draft: Marker studies helped me understand how each animal rests, moves and cares for its young.",
        images: [
          { src: "img-1350.jpg", caption: "Leopards resting in a tree." },
          { src: "img-1352.jpg", caption: "Leopard poses: protecting territory, calling a cub." },
          { src: "img-1355.jpg", caption: "Dugong studies." },
          { src: "img-1356.jpg", caption: "More dugong poses." }
        ]
      },
      {
        name: "Foam prototypes",
        versions: true,
        notes:
          "Draft: I cut the puzzles in foam to test how the pieces fit, how thick they should be, and whether small hands could pull them apart.",
        images: [
          { src: "img-1360.jpg", caption: "Foam puzzles on the workbench." },
          { src: "img-1362.jpg", caption: "A small nested animal." },
          { src: "img-1363.jpg", caption: "Curled-up sleeping animal." },
          { src: "img-1364.jpg", caption: "Leaf-shaped puzzle." },
          { src: "img-1375.jpg", caption: "Tall nested puzzle." },
          { src: "img-1452.jpg", caption: "Pink foam leopard." },
          { src: "img-1483.jpg", caption: "Pink foam dugong puzzle." }
        ]
      },
      {
        name: "Wood",
        notes:
          "Draft: Moving to wood meant smoother curves and tighter fits. I cut the pieces and checked they stood up on their own.",
        images: [
          { src: "78509887587-d481af84-3caa-44c5-8460-a2e4f21dbcb8.jpg", caption: "First wooden puzzle, assembled." },
          { src: "78509898806-f30134fe-389e-4f83-8ac0-c034ba2afc05.jpg", caption: "Wooden pieces standing up." }
        ]
      },
      {
        name: "Final design",
        notes:
          "Draft: The final dugong is hand-stained in purple, blue, green and yellow, with smaller sea creatures tucked inside.",
        compare: {
          before: "img-1483.jpg",
          after: "leaf-dugong.jpg",
          beforeLabel: "foam",
          afterLabel: "wood"
        },
        images: [
          { src: "leaf-dugong.jpg", caption: "The finished stained-wood dugong puzzle." }
        ]
      }
    ]
  }
];

/* Small helpers shared by every page */
// where a project opens: its own page if it has one, otherwise the shared page
window.projectLink = function (p) {
  return p.page || "project.html?p=" + encodeURIComponent(p.id);
};
window.projectImg = function (project, src) {
  return project.folder + src;
};
window.findProject = function (id) {
  return window.PROJECTS.find(function (p) { return p.id === id; });
};
