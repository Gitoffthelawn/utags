import { $, $$, createElement } from "browser-extension-utils"
import styleText from "data-text:./content.scss"

import createTag from "./components/tag"
import { getConditionNodes, getListNodes, matchedNodes } from "./sites/index"
import {
  addTagsValueChangeListener,
  getTags,
  getUrlMap,
  mergeData,
  migration,
  saveTags,
} from "./storage/index"

const hostname = location.hostname

const getStyle = () => {
  const style = createElement("style")
  style.id = "utags_style"
  style.textContent = styleText
  document.head.append(style)
  // return style
}

function appendTagsToPage(
  element,
  key,
  tags: string[],
  meta: Record<string, any>
) {
  if (element.nextSibling?.classList?.contains("utags_ul")) {
    element.nextSibling.remove()
  }

  const ul = createElement("ul")
  let li = createElement("li")
  let a = createElement("a")
  a.textContent = "🏷️"
  a.setAttribute(
    "class",
    tags.length === 0
      ? "utags_text_tag utags_captain_tag"
      : "utags_text_tag utags_captain_tag2"
  )
  a.addEventListener("click", async function () {
    // eslint-disable-next-line no-alert
    const newTags = prompt(
      "[UTags] 请输入标签，用逗号分开多个标签",
      tags.join(", ")
    )
    if (newTags !== null) {
      const newTagsArray = newTags.split(/\s*[,，]\s*/)
      await saveTags(key, newTagsArray, meta)
    }
  })
  li.append(a)
  ul.append(li)

  for (const tag of tags) {
    li = createElement("li")
    a = createTag(tag)
    li.append(a)
    ul.append(li)
  }

  ul.setAttribute("class", "utags_ul")
  element.after(ul)
}

async function displayTags() {
  const conditionNodes = getConditionNodes(hostname)
  for (const node of conditionNodes) {
    node.dataset.utags_condition_node = ""
  }

  // Display tags for matched components on matched pages
  const nodes = matchedNodes(hostname)
  await Promise.all(
    nodes.map(async (node) => {
      if (!node.utags || !node.utags.key) {
        return
      }

      const object = await getTags(node.utags.key)
      const tags = object.tags || []
      appendTagsToPage(node, node.utags.key, tags, node.utags.meta)
    })
  )

  const listNodes = getListNodes(hostname)
  for (const node of listNodes) {
    const tags = node.querySelectorAll(
      "[data-utags_condition_node] + .utags_ul > li > .utags_text_tag[data-utags_tag]"
    )
    if (tags.length > 0) {
      node.dataset.utags_list_node =
        [...tags].reduce(
          (accumulator, tag) => accumulator + "," + tag.textContent,
          ""
        ) + ","
    } else {
      node.dataset.utags_list_node = ""
    }
  }
}

async function outputData() {
  if (
    /^(utags\.pipecraft\.net|localhost|127\.0\.0\.1)$/.test(location.hostname)
  ) {
    const urlMap = await getUrlMap()

    const textarea = createElement("textarea")
    textarea.id = "utags_output"
    textarea.setAttribute("style", "display:none")
    textarea.value = JSON.stringify(urlMap)
    document.body.append(textarea)

    textarea.addEventListener("click", async () => {
      if (textarea.dataset.utags_type === "export") {
        const urlMap = await getUrlMap()
        textarea.value = JSON.stringify(urlMap)
        textarea.dataset.utags_type = "export_done"
        // Triger change event
        textarea.click()
      } else if (textarea.dataset.utags_type === "import") {
        const data = textarea.value
        try {
          const result = await mergeData(JSON.parse(data))
          textarea.value = JSON.stringify(result)
          textarea.dataset.utags_type = "import_done"
          // Triger change event
          textarea.click()
          // eslint-disable-next-line @typescript-eslint/no-implicit-any-catch
        } catch (error) {
          console.error(error)
          textarea.value = JSON.stringify(error)
          textarea.dataset.utags_type = "import_failed"
          // Triger change event
          textarea.click()
        }
      }
    })
  }
}

async function initStorage() {
  await migration()
  addTagsValueChangeListener(displayTags)
}

let countOfLinks = 0
async function main() {
  document.addEventListener("mouseover", (event) => {
    if (event.target && event.target.tagName === "A") {
      // TODO: delay display utags for event.target
      // console.log(event.target, event.currentTarget)
    }
  })
  // TODO: delay display utags in corner of page for current page

  getStyle()
  setTimeout(outputData, 1)

  await initStorage()

  await displayTags()

  countOfLinks = $$("a:not(.utags_text_tag)").length
  setInterval(async () => {
    const count = $$("a:not(.utags_text_tag)").length
    if (countOfLinks !== count) {
      // console.log(countOfLinks, count)
      countOfLinks = count
      await displayTags()
    }
  }, 1000)
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises, unicorn/prefer-top-level-await
main()
