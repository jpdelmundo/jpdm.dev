import Box from "@mui/material/Box";
import { randomPercentage } from "@shared/utils/randomNum";

export function GradientBg() {
    const colors = ["#ff0080", "#40e0d0", "#8000ff", "#ff8c00", "#0051ffff", "#f3f3f3"];
    const randomColorOrder = Array.from({ length: 6 }, (_, i) => i).sort(() => Math.random() - 0.5);
    const radialGradients = randomColorOrder.map(
        idx => `radial-gradient(circle at ${randomPercentage(30, 70)} ${randomPercentage()}, ${colors[idx]} 0%, transparent ${randomPercentage(20, 80)})`
    );

    return (
        <Box
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                width: '100%',
                height: '70vh',
                zIndex: -1,
                pointerEvents: 'none',
                background: radialGradients.join(", "),
                opacity: 0.9,
                maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 70%)',
                WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 70%)',
            }}
        />
    );
}
