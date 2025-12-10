
export function formatLineBreaks(text: string) {
    return text.trim().split('\n\n').map((block, i, arr) => (
        <>
            {block.split('\n').map((line, i, arr) => (
                <>
                    {line}{arr.length - 1 != i && <br />}
                </>
            ))}{arr.length - 1 != i && <span className="double-break" />}
        </>
    ));
}