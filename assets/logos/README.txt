Client logos: trimmed to content bounds, exported at 2x (120px tall), WebP.

To add a client:
  1. Drop the file here.
  2. Add an <li class="logo logo--slug"> to ALL THREE tracks in index.html
     (the first is the real one; the other two are aria-hidden duplicates
     whose images must carry alt="").
  3. Set its optical height: .logo--slug { --h: 44px }

Heights are tuned per logo on purpose. Square marks sit at 48px, long
wordmarks near 30px, and logos on their own dark background lower still.
Do not set them all to the same value.

Do not add loading="lazy" to these images - an undecoded image leaves a gap
in the moving strip.
