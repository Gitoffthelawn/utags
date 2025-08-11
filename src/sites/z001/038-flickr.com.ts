import { $, $$, doc } from "browser-extension-utils"
import styleText from "data-text:./038-flickr.com.scss"
import { getTrimmedTitle } from "utags-utils"

import {
  addVisited,
  markElementWhetherVisited,
  setVisitedAvailable,
} from "../../modules/visited"
import type { UserTagMeta, UtagsHTMLElement } from "../../types"

export default (() => {
  // Constants
  const CANONICAL_BASE_URL = "https://www.flickr.com/"

  /**
   * Normalize URL to canonical format
   * @param url - The URL to normalize
   * @returns Normalized URL with HTTPS and www prefix
   */
  function getCanonicalUrl(url: string): string {
    // Handle flickr.com without www
    if (/^https?:\/\/flickr\.com/.test(url)) {
      return url.replace(
        /^https?:\/\/flickr\.com/,
        CANONICAL_BASE_URL.slice(0, -1)
      )
    }

    return url
  }

  return {
    matches: /flickr\.com/,
    listNodesSelectors: [
      // ".topic-list .topic-list-body tr",
      // // replies
      // ".topic-area .topic-post",
      // // search results
      // ".search-results .fps-result",
      // // categories
      // ".column .latest-topic-list .latest-topic-list-item",
    ],
    conditionNodesSelectors: [
      // topic title
      // ".topic-list .topic-list-body tr .title",
      // // category
      // ".topic-list .topic-list-body tr .badge-category__wrapper",
      // // tag
      // ".topic-list .topic-list-body tr .discourse-tag",
      // // author
      // ".topic-list .topic-list-body tr .posters a:first-of-type",
      // // mobile - author
      // ".mobile-view .topic-list a[data-user-card]",
      // // replies
      // ".topic-area .topic-post:nth-of-type(n+2) .topic-meta-data:not(.embedded-reply) .names a",
      // // search results
      // ".search-results .fps-result .search-link",
      // ".search-results .fps-result .badge-category__wrapper",
      // ".search-results .fps-result .discourse-tag",
      // // Maybe it's the author of the post, not the author of the topic.
      // // ".search-results .fps-result .author a",
      // // categories
      // ".column .latest-topic-list .latest-topic-list-item .main-link .title",
      // ".column .latest-topic-list .latest-topic-list-item .main-link .badge-category__wrapper",
      // ".column .latest-topic-list .latest-topic-list-item .main-link .discourse-tag",
    ],

    excludeSelectors: [
      ".global-nav",
      '[role="navigation"]',
      '[aria-label="Tabs"]',
      "footer .lang-switcher",
      ".gift-pro-link",
      ".pagination-view",
      ".navigate-target",
      ".more-link",
      ".view-more-link",
      ".droparound.menu",
      ".photo-sidebar-toggle-view",
      ".attribution-info .username",
      ".photo-license-info",
      '[href*="upgrade/pro"]',
      "h5.tag-list-header",
    ],
    getStyle: () => styleText,
    getCanonicalUrl,
  }
})()
