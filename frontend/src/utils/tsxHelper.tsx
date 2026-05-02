import React from 'react';

const URL_REGEX = /\bhttps?:\/\/[^\s<>)"]+/gi;

export function formatLineBreaks(text: string) {
    return text.trim().split('\n\n').map((block, i, arr) => (
        <React.Fragment key={i}>
            {block.split('\n').map((line, i, arr) => (
                <React.Fragment key={i}>
                    {line}{arr.length - 1 != i && <br />}
                </React.Fragment>
            ))}{arr.length - 1 != i && <span className="double-break" />}
        </React.Fragment>
    ));
}

export function linkify(text: string) {
    const nodes = [];
    let last = 0;

    for (const match of text.matchAll(URL_REGEX)) {
        const url = match[0];
        const start = match.index!;

        if (start > last) nodes.push(text.slice(last, start));

        nodes.push(
            <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'rgb(29, 155, 240)' }}>
                {url}
            </a>
        );

        last = start + url.length;
    }

    if (last < text.length) nodes.push(text.slice(last));

    return nodes;
}