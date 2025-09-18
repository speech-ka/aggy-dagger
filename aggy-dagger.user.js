// ==UserScript==
// @name         aggy dagger
// @namespace    http://tampermonkey.net/
// @version      2025-09-17
// @description  try to take over the world!
// @author       speech-ka
// @match        https://boards.4chan.org/vg/thread/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=4chan.org
// @grant        none
// @run-at       document-end
// @require      https://update.greasyfork.org/scripts/488161/1335321/wait-for-element.js
// ==/UserScript==

(function() {
    'use strict'

    function extractText(element) {
        let text = ''

        function traverse(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                const trimmed = node.textContent.trim().trimEnd()
                if (trimmed) {
                    let t = trimmed.replaceAll(/>(?:>\d+)?/g, "")
                    text += t ? t + "\n" : ""
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                for (let child of node.childNodes) {
                    traverse(child)
                }
            }
        }

        traverse(element)
        return text.trimEnd()
    }

    let visitedMessages = new Map()
    let textMessages = new Set()

    waitForElement(`.post.reply`)
    setInterval(
        _ => {
            document
                .querySelectorAll(
                    `.post.reply`
                )
                .forEach(
                    post => {
                        let postMessage = post.querySelector(`.postMessage`)
                        let text = extractText(postMessage)

                        if (visitedMessages.has(postMessage.getAttribute("id"))) {
                            return
                        }

                        visitedMessages.set(postMessage.getAttribute("id"), post)
                        let isDuplicate = textMessages.has(text)
                        textMessages.add(text)

                        if (
                            Array
                                .from(
                                    postMessage.childNodes
                                )
                                .some(
                                    node => node
                                                .nodeType === Node.TEXT_NODE &&
                                                node
                                                    .textContent
                                                    .trim() !== ''
                                )
                        ) {
                            return
                        }

                        let quotes = postMessage.querySelectorAll(".quote")
                        if (quotes.length != 1) {
                            return
                        }


                        if (
                            post
                                .querySelector(`.file`)
                               ?.querySelector(`.fileThumb`)
                            ?? false
                        ) {
                            return
                        }

                        if (isDuplicate) {
                            document
                                .querySelector(
                                    `[id="${
                                        postMessage.getAttribute("id").replace("m", "pc")
                                    }"]`
                                ).remove()
                            visitedMessages
                                .forEach(
                                    (post, id) => {
                                        if (
                                            extractText(post)
                                                .includes(
                                                    postMessage
                                                        .getAttribute("id")
                                                        .replace(/\w+/, "")
                                                    )
                                        ) {
                                            post.remove()
                                        }
                                    }
                            )
                        }

                    }
                )
        }
        , 2500
    )
})()
