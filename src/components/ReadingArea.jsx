import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ReadingArea = ({ sanskritText, tibetanText, chineseText, onSanskritChange, onTibetanChange, onChineseChange }) => {
    const [translations, setTranslations] = useState({});
    const [analyses, setAnalyses] = useState({});
    const [details, setDetails] = useState({});
    const [maxHeights, setMaxHeights] = useState([]);

    const sanskritRefs = useRef([]);
    const tibetanRefs = useRef([]);
    const chineseRefs = useRef([]);

    const getTranslation = async (text, index, language) => {
        const url = "https://dharmamitra.org/api/translation-no-stream/";

        try {
            // 请求英文翻译
            const englishResponse = await axios.post(url, {
                input_sentence: text,
                input_encoding: "auto",
                target_lang: "english",
            }, {
                headers: { "Content-Type": "application/json" },
            });

            // 请求现代中文翻译
            const chineseResponse = await axios.post(url, {
                input_sentence: text,
                input_encoding: "auto",
                target_lang: "modern-chinese",
            }, {
                headers: { "Content-Type": "application/json" },
            });

            if (englishResponse.status === 200 && chineseResponse.status === 200) {
                const updatedTranslations = { ...translations };
                updatedTranslations[language] = {
                    ...updatedTranslations[language],
                    [index]: {
                        english: englishResponse.data || "翻译失败",
                        chinese: chineseResponse.data || "翻译失败",
                    },
                };
                setTranslations(updatedTranslations);
            } else {
                alert(`翻译失败，状态码: 英文(${englishResponse.status}), 中文(${chineseResponse.status})`);
            }
        } catch (error) {
            alert(`翻译请求出错: ${error.message}`);
        }
    };

    const analyzeGrammar = async (text, index, language) => {
        const url = "https://dharmamitra.org/api/tagging/";
        const payload = {
            input_sentence: text,
            input_encoding: "auto",
            human_readable_tags: true,
            mode: "unsandhied-lemma-morphosyntax",
        };

        try {
            const response = await axios.post(url, payload, {
                headers: { "Content-Type": "application/json" },
            });

            if (response.status === 200) {
                const updatedAnalyses = { ...analyses };
                updatedAnalyses[language] = {
                    ...updatedAnalyses[language],
                    [index]: response.data.map(entry => entry.grammatical_analysis).flat() || [],
                };
                setAnalyses(updatedAnalyses);
            } else {
                alert(`解析失败，状态码: ${response.status}`);
            }
        } catch (error) {
            alert(`解析请求出错: ${error.message}`);
        }
    };

    const showDetails = (entry, language) => {
        setDetails({
            ...details,
            [language]: {
                lemma: entry.lemma,
                unsandhied: entry.unsandhied,
                tag: entry.tag,
                meanings: entry.meanings,
                paragraphIndex: entry.paragraphIndex,
            },
        });
    };

    const formatText = (text, onChange, language, refs) => {
        const paragraphs = text.split('\n');

        return paragraphs.map((paragraph, index) => (
            <div key={index} style={{ marginBottom: '1rem', border: '1px solid #ccc', padding: '8px' }}>
                <textarea
                    style={{
                        resize: 'none',
                        border: '1px solid #ccc',
                        padding: '8px',
                        fontSize: '16px',
                        width: '100%',
                        marginBottom: '1rem',
                        overflow: 'hidden',
                    }}
                    value={paragraph}
                    onChange={(e) => {
                        const updatedParagraphs = [...paragraphs];
                        updatedParagraphs[index] = e.target.value;
                        onChange(updatedParagraphs.join('\n'));
                    }}
                    rows={1}
                    ref={(textarea) => {
                        if (textarea) {
                            refs.current[index] = textarea;
                            textarea.style.height = 'auto'; // Reset height to auto to recalculate
                            textarea.style.height = `${textarea.scrollHeight}px`; // Set height to scrollHeight
                        }
                    }}
                    onInput={(e) => {
                        e.target.style.height = 'auto'; // Reset height to auto to recalculate
                        e.target.style.height = `${e.target.scrollHeight}px`; // Set height to scrollHeight
                    }}
                />
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                        style={{ marginRight: '8px', padding: '4px 8px', fontSize: '12px' }}
                        onClick={() => analyzeGrammar(paragraph, index, language)}
                    >
                        解析
                    </button>
                    {analyses[language]?.[index] && analyses[language][index].map((entry, idx) => (
                        <button
                            key={idx}
                            style={{ margin: '4px', padding: '4px 8px', fontSize: '12px', whiteSpace: 'nowrap' }}
                            onClick={() => showDetails({ ...entry, paragraphIndex: index }, language)}
                        >
                            {entry.unsandhied}
                        </button>
                    ))}
                </div>
                {details[language]?.paragraphIndex === index && (
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', fontSize: '12px' }}>
                        <thead>
                            <tr>
                                <th style={{ border: '1px solid #ccc', padding: '8px' }}>属性</th>
                                <th style={{ border: '1px solid #ccc', padding: '8px' }}>值</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>Lemma</td>
                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{details[language].lemma}</td>
                            </tr>
                            <tr>
                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>Tag</td>
                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{details[language].tag}</td>
                            </tr>
                            <tr>
                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>Meanings</td>
                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{details[language].meanings.join(', ')}</td>
                            </tr>
                        </tbody>
                    </table>
                )}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <button
                        style={{ marginRight: '8px', padding: '4px 8px', fontSize: '12px' }}
                        onClick={() => getTranslation(paragraph, index, language)}
                    >
                        翻译
                    </button>
                    <div style={{ fontStyle: 'italic', flex: 1 }}>
                        {translations[language]?.[index]?.english || "点击翻译按钮获取英文结果"}
                        <br />
                        {translations[language]?.[index]?.chinese || "点击翻译按钮获取中文结果"}
                    </div>
                </div>
                <button
                    style={{ padding: '4px 8px', fontSize: '12px', width: '100%' }}
                    onClick={() => {
                        const updatedParagraphs = paragraphs.filter((_, i) => i !== index);
                        onChange(updatedParagraphs.join('\n'));
                    }}
                >
                    删除
                </button>
                <div style={{ height: maxHeights[index] - (refs.current[index]?.offsetHeight || 0) }}></div>
            </div>
        ));
    };

    useEffect(() => {
        const calculateMaxHeights = () => {
            const newMaxHeights = [];
            const maxLength = Math.max(sanskritRefs.current.length, tibetanRefs.current.length, chineseRefs.current.length);
            for (let i = 0; i < maxLength; i++) {
                const sanskritHeight = sanskritRefs.current[i]?.offsetHeight || 0;
                const tibetanHeight = tibetanRefs.current[i]?.offsetHeight || 0;
                const chineseHeight = chineseRefs.current[i]?.offsetHeight || 0;
                newMaxHeights[i] = Math.max(sanskritHeight, tibetanHeight, chineseHeight);
            }
            setMaxHeights(newMaxHeights);
        };

        calculateMaxHeights();

        const resizeObserver = new ResizeObserver(calculateMaxHeights);
        [...sanskritRefs.current, ...tibetanRefs.current, ...chineseRefs.current].forEach(ref => {
            if (ref) {
                resizeObserver.observe(ref);
            }
        });

        return () => {
            resizeObserver.disconnect();
        };
    }, [sanskritText, tibetanText, chineseText]);

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: '1 1 33%', margin: '0 8px', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>梵语</h2>
                {formatText(sanskritText, onSanskritChange, 'sanskrit', sanskritRefs)}
            </div>
            <div style={{ flex: '1 1 33%', margin: '0 8px', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>藏语</h2>
                {formatText(tibetanText, onTibetanChange, 'tibetan', tibetanRefs)}
            </div>
            <div style={{ flex: '1 1 33%', margin: '0 8px', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>汉语或其他语言。</h2>
                {formatText(chineseText, onChineseChange, 'chinese', chineseRefs)}
            </div>
        </div>
    );
};

export default ReadingArea;    