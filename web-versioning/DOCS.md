# Developer Documentaiton

## Story

In the background, the server is processing URLs:

* It requests a diff from PageFreezer (or some similar API).
* It caches the results along with a hash of the raw diff. This can be used to
  identify unique diffs and relate identical ones.
* Meanwhile, each unique diff is assigned a priority. To start, this prority may
  simply be 1 (probably interesting) or 0 (probably not interesting).

When a user shows up:

* User specifies any domain allocation preferences.
* User requests the "next" URL to look at.
* Server determines the highest priority diff that needs evaluation and
  redirects user to ``/diff/<DIFF_HASH>``. This is a permanent link that can be
  shared or revisited later.
* The page at ``/diff/<DIFF_HASH>`` displays viral statistics about the diff,
  gleaned from PageFreezer's result object, including text-only changes and
  source changes.
* Meanwhile, a visual diff is loaded asynchronously on the client side.
* The user enters their evaluation of the diff. (Significant changes? Comments?) This information is stored.
* The process repeats.

## Components

A database (sqlite just for now) with:

* A table of URLs of interest.
* A table of cached PageFreezer diff results.
* A table of priorities associated with unique diffs.
* A table of user-submitted evaluations linked to unique diffs. There could be
  more than one evaluation of a given diff.

A server written in Python using the Tornado framework.

A frontend using TypeScript, JQuery, and Bootstrap.
