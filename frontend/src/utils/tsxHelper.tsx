import React from "react";

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