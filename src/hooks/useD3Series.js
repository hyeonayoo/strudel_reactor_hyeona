import { useEffect, useState } from 'react';

export default function useD3Series(bandsCount = 48) {
    const [bands, setBands] = useState(Array.from({ length: bandsCount }, () => 0));
    const [series, setSeries] = useState([]);

    useEffect(() => {
        const onBands = (e) => Array.isArray(e.detail) && setBands(e.detail.slice(0, bandsCount));
        const onSeries = (e) => Array.isArray(e.detail) && setSeries(e.detail);
        document.addEventListener('d3Data', onBands);
        document.addEventListener('d3Series', onSeries);
        return () => {
            document.removeEventListener('d3Data', onBands);
            document.removeEventListener('d3Series', onSeries);
        };
    }, [bandsCount]);

    return { bands, series, setBands, setSeries };
}
