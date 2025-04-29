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
        if (text.length > 500) { // 假设 500 是允许的最大字符数
            alert("文本过长，请控制在 500 字以内");
            return;
        }

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
        if (text.length > 500) { // 假设 500 是允许的最大字符数
            alert("文本过长，请控制在 500 字以内");
            return;
        }

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
                <div ref={(el) => refs.current[index] = el}>
                <textarea
                    style={{
                        resize: 'none',
                        border: '1px solid #ccc',
                        padding: '8px',
                        fontSize: '16px',
                        fontFamily: 'Times New Roman , sans-serif',
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
                    <div style={{ fontStyle: 'italic', flex: 1 }} id="TranslationDiv">
                        <span
                            contentEditable
                            suppressContentEditableWarning
                            style={{
                                display: 'block',
                                padding: '4px',
                                border: '1px solid transparent',
                                fontSize: '14px',
                                marginBottom: '0.5rem',
                                outline: 'none',
                                cursor: 'text',
                            }}
                            onBlur={(e) => {
                                const updatedTranslations = { ...translations };
                                if (!updatedTranslations[language]) updatedTranslations[language] = {};
                                if (!updatedTranslations[language][index]) updatedTranslations[language][index] = {};
                                updatedTranslations[language][index].english = e.target.textContent;
                                setTranslations(updatedTranslations);
                            }}
                        >
                            {translations[language]?.[index]?.english || "点击翻译按钮获取英文结果"}
                        </span>
                        <span
                            contentEditable
                            suppressContentEditableWarning
                            style={{
                                display: 'block',
                                padding: '4px',
                                border: '1px solid transparent',
                                fontSize: '14px',
                                outline: 'none',
                                cursor: 'text',
                            }}
                            onBlur={(e) => {
                                const updatedTranslations = { ...translations };
                                if (!updatedTranslations[language]) updatedTranslations[language] = {};
                                if (!updatedTranslations[language][index]) updatedTranslations[language][index] = {};
                                updatedTranslations[language][index].chinese = e.target.textContent;
                                setTranslations(updatedTranslations);
                            }}
                        >
                            {translations[language]?.[index]?.chinese || "点击翻译按钮获取中文结果"}
                        </span>
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
                </div>
                <div style={{ height: maxHeights[index] - (refs.current[index]?.offsetHeight || 0) }}></div>
            </div>
        ));
    };

    const exportToJson = async (text, translations, language) => {
        const paragraphs = text.split('\n');
        const data = paragraphs.map((paragraph, index) => ({
            text: paragraph,
            translation: translations[language]?.[index] || {},
        }));

        const fileHandle = await window.showDirectoryPicker();

        // 导出 JSON 文件
        const jsonFile = await fileHandle.getFileHandle(`${language}-export.json`, { create: true });
        const jsonWritable = await jsonFile.createWritable();
        await jsonWritable.write(JSON.stringify(data, null, 2));
        await jsonWritable.close();

        // 导出中文翻译 TXT 文件
        const chineseText = paragraphs.map((_, index) => translations[language]?.[index]?.chinese || '').join('\n');
        const chineseFile = await fileHandle.getFileHandle(`${language}-chinese.txt`, { create: true });
        const chineseWritable = await chineseFile.createWritable();
        await chineseWritable.write(chineseText);
        await chineseWritable.close();

        // 导出英文翻译 TXT 文件
        const englishText = paragraphs.map((_, index) => translations[language]?.[index]?.english || '').join('\n');
        const englishFile = await fileHandle.getFileHandle(`${language}-english.txt`, { create: true });
        const englishWritable = await englishFile.createWritable();
        await englishWritable.write(englishText);
        await englishWritable.close();
    };

    const handleJsonUpload = (event, onChange, language) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    const text = data.map(item => item.text).join('\n');

                    // 更新翻译状态
                    const updatedTranslations = { ...translations };
                    updatedTranslations[language] = data.reduce((acc, item, index) => {
                        acc[index] = {
                            english: item.translation.english || "",
                            chinese: item.translation.chinese || "",
                        };
                        return acc;
                    }, {});
                    
                    setTranslations(updatedTranslations);
                    onChange(text);
                    
                    
                } catch (error) {
                    alert('导入的文件格式不正确，请选择正确的 JSON 文件。');
                }
            };
            reader.readAsText(file);
        }
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
                <label style={{ cursor: 'pointer', marginBottom: '1rem' }}>
                    导入json文件
                </label>
                <input
                    id ="sanskritFileInput"
                    type="file"
                    accept="application/json"
                    style={{ marginBottom: '1rem' }}
                    onChange={(e) => handleJsonUpload(e, onSanskritChange, "sanskrit")}
                />
                <button
                    style={{ marginBottom: '1rem', padding: '8px', fontSize: '14px' }}
                    onClick={() => exportToJson(sanskritText, translations, 'sanskrit')}
                >
                    导出梵语
                </button>
                {formatText(sanskritText, onSanskritChange, 'sanskrit', sanskritRefs)}
            </div>
            <div style={{ flex: '1 1 33%', margin: '0 8px', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>藏语</h2>
                <label style={{ cursor: 'pointer', marginBottom: '1rem' }}>
                    导入json文件
                </label>
                <input
                    type="file"
                    accept="application/json"
                    style={{ marginBottom: '1rem' }}
                    onChange={(e) => handleJsonUpload(e, onTibetanChange, 'tibetan')}
                />
                <button
                    style={{ marginBottom: '1rem', padding: '8px', fontSize: '14px' }}
                    onClick={() => exportToJson(tibetanText, translations, 'tibetan')}
                >
                    导出藏语
                </button>
                {formatText(tibetanText, onTibetanChange, 'tibetan', tibetanRefs)}
            </div>
            <div style={{ flex: '1 1 33%', margin: '0 8px', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>汉语或其他语言</h2>
                <label style={{ cursor: 'pointer', marginBottom: '1rem' }}>
                    导入json文件
                </label>
                <input
                    type="file"
                    accept="application/json"
                    style={{ marginBottom: '1rem' }}
                    onChange={(e) => handleJsonUpload(e, onChineseChange, 'chinese')}
                />
                <button
                    style={{ marginBottom: '1rem', padding: '8px', fontSize: '14px' }}
                    onClick={() => exportToJson(chineseText, translations, 'chinese')}
                >
                    导出汉语
                </button>
                {formatText(chineseText, onChineseChange, 'chinese', chineseRefs)}
            </div>
        </div>
    );
};

export default ReadingArea;