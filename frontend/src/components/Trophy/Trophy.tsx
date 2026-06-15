import { useEffect, useState } from "react";
import { Image, Layout, Tooltip } from "antd";
import woodTrophy from '../../assets/images/wood-trophy.svg';
import copperTrophy from '../../assets/images/copper-trophy.svg';
import ironTrophy from '../../assets/images/iron-trophy.svg';
import goldenTrophy from '../../assets/images/gold-trophy.svg';
import diamondTrophy from '../../assets/images/diamond-trophy.svg';
import rainbowTrophy from '../../assets/images/rainbow-trophy.svg';

interface ITrophyProps {
    count: number;
}

interface TrophyLevel {
    name: string;
    threshold: number;
    image: string;
}

const trophyLevels: TrophyLevel[] = [
    { name: 'Madeira', threshold: 0, image: woodTrophy },
    { name: 'Cobre', threshold: 25, image: copperTrophy },
    { name: 'Ferro', threshold: 50, image: ironTrophy },
    { name: 'Ouro', threshold: 100, image: goldenTrophy },
    { name: 'Diamante', threshold: 250, image: diamondTrophy },
    { name: 'Arco-íris', threshold: 500, image: rainbowTrophy },
];

export default function TrophyCollection({ count }: ITrophyProps) {
    const [_, setUnlockedTrophies] = useState<TrophyLevel[]>([]);

    useEffect(() => {
        const unlocked = trophyLevels.filter(trophy => count >= trophy.threshold);
        setUnlockedTrophies(unlocked);
    }, [count]);

    const getOpacity = (trophy: TrophyLevel, index: number): number => {
        if (count >= trophy.threshold) {
            return 1;
        }

        const previousTrophy = trophyLevels[index - 1];
        const nextThreshold = trophy.threshold;
        const previousThreshold = previousTrophy?.threshold || 0;

        if (count >= previousThreshold && count < nextThreshold) {
            const progress = (count - previousThreshold) / (nextThreshold - previousThreshold);
            return 0.3 + (progress * 0.7);
        }

        return 0.2;
    };

    const getTooltipContent = (trophy: TrophyLevel): string => {
        if (count >= trophy.threshold) {
            return `Troféu ${trophy.name} - Conquistado! (${trophy.threshold}+ avaliações)`;
        }

        const remaining = trophy.threshold - count;
        return `Troféu ${trophy.name} - Faltam ${remaining} avaliações (${trophy.threshold} necessárias)`;
    };

    return (
        <Layout style={{
            background: 'transparent',
            display: 'flex',
            flexDirection: 'row',
            gap: '8px',
            alignItems: 'center'
        }}>
            {trophyLevels.map((trophy, index) => (
                <Tooltip
                    key={trophy.name}
                    title={getTooltipContent(trophy)}
                    placement="top"
                >
                    <div style={{ position: 'relative', width: '40px', height: '40px' }}>
                        <Image
                            loading="lazy"
                            src={trophy.image}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                opacity: getOpacity(trophy, index),
                                transition: 'opacity 0.3s ease',
                                filter: count < trophy.threshold ? 'grayscale(70%)' : 'none'
                            }}
                            preview={false}
                            alt={`Troféu ${trophy.name}`}
                        />
                    </div>
                </Tooltip>
            ))}
        </Layout>
    );
}