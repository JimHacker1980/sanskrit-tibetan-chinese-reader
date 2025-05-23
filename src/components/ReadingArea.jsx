import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
const ReadingArea = ({ sanskritText, tibetanText, chineseText, onSanskritChange, onTibetanChange, onChineseChange }) => {
    const [translations, setTranslations] = useState({});
    const [analyses, setAnalyses] = useState({});
    const [details, setDetails] = useState({});
    const [maxHeights, setMaxHeights] = useState([]);
    const [queryResult, setQueryResult] = useState('');
    const [isCtrlPressed, setIsCtrlPressed] = useState(false);
    const [popupData, setPopupData] = useState({
        isOpen: false,
        selectedText: '',
        language: '',
        index: 0,
        position: { left: 0, top: 0 }
    });
    const [sanskritFileName, setSanskritFileName] = useState("");

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

    const handleSelection = (selectedText, language, index, position) => {
        if (selectedText.trim()) {
            setPopupData({
                isOpen: true,
                selectedText,
                language,
                index,
                position
            });
        }
    };

    const handleQuery = async () => {
        const { selectedText, language } = popupData;
        const query = selectedText.trim();
        let url = '';
        // 天城体和拉丁转写到Harvard - Kyoto转写的映射表
        const sanskritToHKMap = {
            // 元音
            'अ': 'a', 'आ': 'A','ā': 'A', 'इ': 'i', 'ई': 'I', 'ī': 'I', 'उ': 'u', 'ऊ': 'U','ū': 'U',
            'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
            'ऋ': 'R','ṛ': 'R', 'ॠ': 'RR','ṝ': 'RR', 'ऌ': 'lR','ḷ': 'lR', 'ॡ': 'lRR','ḹ': 'lRR',
            ' ा': 'A', ' ि': 'i', ' ी': 'I',  ' ु': 'u', ' ू': 'U',
            ' े': 'e', ' ै': 'ai', ' ो': 'o', 'ौ': 'au',
            ' ृ': 'R', "ॄ": 'RR', "ॢ": 'lR', "ॣ": 'lRR',
            ' ्': '',
            // 鼻音和送气符
            'ं': 'M', 'ṃ': 'aM', 'ः': 'H', 'ḥ': 'H',
            // 辅音
            'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'G','ṅ': 'G',
            'च': 'c', 'छ': 'ch', 'ज': 'j', 'झ': 'jh', 'ञ': 'J','ñ': 'J',
            'ṭ': 'T', 'ṭh': 'Th', 'ḍ': 'D', 'ḍha': 'Dh', 'ṇ': 'N',
            'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
            'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
            'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v',
            'श': 'z', 'ष': 'S', 'ś': 'z', 'ṣ': 'S', 'स': 's', 'ह': 'h', 'ळ': 'L','ḻ': 'L'
        };
    
        // 转换函数
        const convertToHK = (text) => {
            let result = '';
            for (let i = 0; i < text.length; i++) {
                if (sanskritToHKMap[text[i]]) {
                    result += sanskritToHKMap[text[i]];
                } else if (i < text.length - 1 && sanskritToHKMap[text.slice(i, i + 2)]) {
                    result += sanskritToHKMap[text.slice(i, i + 2)];
                    i++;
                } else {
                    result += text[i];
                }
            }
            return result;
        };

        // 用于存储藏语转写数据的对象
        const tibetanTransliterationMap = {};
        const loadTibetanTransliteration = async () => {
            try {
                const response = await fetch('/src/data/tibetan_transliteration.json');
                const data = await response.json();
                Object.assign(tibetanTransliterationMap, data);
            } catch (error) {
                console.error('加载藏语转写文件出错:', error);
            }
        };


        const convertTibetan = (text) => {
            let isTibetan = /[\u0F00-\u0FFF]/.test(text);
            let words;
            if (isTibetan) {
                words = text.split('་');
            } else {
                words = text.split(' ');
            }
            let result = '';
            for (let i = 0; i < words.length; i++) {
                let word = words[i];
                if (word) {
                    if (isTibetan) {
                        if (tibetanTransliterationMap[word]) {
                            result += tibetanTransliterationMap[word];
                        } else {
                            throw new Error(`未找到藏文词 "${word}" 的转写`);
                        }
                        if (i < words.length - 1) {
                            if (tibetanTransliterationMap['་']) {
                                result += tibetanTransliterationMap['་'];
                            } else {
                                throw new Error('未找到藏文符号 "་" 的转写');
                            }
                        }
                    } else {
                        let convertedWord = word.replace(/'/g, '%27');
                        if (tibetanTransliterationMap[convertedWord]) {
                            result += tibetanTransliterationMap[convertedWord];
                        } else {
                            // 若不是藏文且未找到转写，直接使用原词
                            result += convertedWord;
                        }
                        if (i < words.length - 1) {
                            if (tibetanTransliterationMap[' ']) {
                                result += tibetanTransliterationMap[' '];
                            } else {
                                // 若未找到空格转写，使用原空格
                                result += ' ';
                            }
                        }
                    }
                }
            }
            // 删除尾部的 %20 符号
            result = result.replace(/%20$/, '');
            return result;
        };    
    
        if (language ==='sanskrit') {
            const hkQuery = convertToHK(query);
            url = `https://www.sanskrit-lexicon.uni-koeln.de/scans/MWScan/2020/web/webtc/indexcaller.php?key=${encodeURIComponent(hkQuery)}`;
        } else if (language === 'tibetan') {
                // 加载藏语转写数据
            await loadTibetanTransliteration();
            try {
                const transliteratedQuery = convertTibetan(query);
                const encodedQuery = encodeURIComponent(transliteratedQuery);
                url = `https://dictionary.christian-steinert.de/#{"activeTerm":"${encodedQuery}","lang":"tib","inputLang":"tib","currentListTerm":"${encodedQuery}","forceLeftSideVisible":true,"offset":0}`;
            } catch (error) {
                console.error('藏文转换出错:', error);
                return;
            }
        } else if (language === 'chinese') {
            url = `https://www.zdic.net/hans/${encodeURIComponent(query)}`;
        }
    
        try {
            // 为每个语言设置不同的窗口名称
            let windowName = '';
            if (language ==='sanskrit') {
                windowName ='sanskritDictionaryWindow';
            } else if (language === 'tibetan') {
                windowName = 'tibetanDictionaryWindow';
            } else if (language === 'chinese') {
                windowName = 'chineseDictionaryWindow';
            }
    
            // 打开或更新窗口
            window.open(url, windowName, 'noopener noreferrer');
        } catch (error) {
            console.error('查询出错:', error);
        }
    
        setPopupData(prev => ({...prev, isOpen: false }));
    };    

    // 处理点击小窗口外部，关闭小窗口
    const ClosePopUp = (e) => {
        const popup = document.getElementById('popup-window');
        if (popup &&!popup.contains(e.target)) {
            // 设置一个 10 秒（10000 毫秒）的延迟
            setTimeout(() => {
                setPopupData(prev => ({...prev, isOpen: false }));
            }, 0);
        }
    };
    const handleSelectionChange = () => {
        const selectedText = window.getSelection().toString();
        if (!selectedText && popupData.isOpen) {
            ClosePopUp({ target: null });
        }
    };

    // 格式化文本并渲染相关组件
    const formatText = (text, onChange, language, refs) => {
        const paragraphs = text.split('\n');

        return paragraphs.map((paragraph, index) => (
            <div key={index} style={{ maxWidth: '420px', width: '100%', margin: '0 auto 1rem auto', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.6rem', boxShadow: '0 1px 4px #0001', padding: '0.7rem', transition: 'box-shadow 0.2s', position: 'relative', minWidth: '0' }}>
                <div ref={(el) => refs.current[index] = el}>
                    <textarea
                        style={{
                            resize: 'none',
                            border: '1px solid #d1d5db',
                            borderRadius: '0.4rem',
                            padding: '6px',
                            fontSize: '15px',
                            fontFamily: 'Times New Roman, sans-serif',
                            width: '96%',
                            marginBottom: '0.7rem',
                            background: '#f9fafb',
                            boxShadow: '0 1px 2px #0001',
                            outline: 'none',
                            transition: 'border 0.2s',
                            minWidth: 0
                        }}
                        value={paragraph}
                        onSelect={(e) => {
                            const selectedText = window.getSelection().toString();
                            const range = window.getSelection().getRangeAt(0);
                            const rect = range.getBoundingClientRect();
                            const position = {
                                left: rect.left + window.scrollX,
                                top: rect.top + window.scrollY
                            };
                            handleSelection(selectedText, language, index, position);
                        }}
                        onChange={(e) => {
                            const updatedParagraphs = [...paragraphs];
                            updatedParagraphs[index] = e.target.value;
                            onChange(updatedParagraphs.join('\n'));
                        }}
                        rows={1}
                        ref={(textarea) => {
                            if (textarea) {
                                textarea.style.height = 'auto';
                                textarea.style.height = `${textarea.scrollHeight}px`;
                            }
                        }}
                        onInput={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.3rem', flexWrap: 'wrap', gap: '4px' }}>
                        <button
                            style={{ marginRight: '4px', padding: '2px 8px', fontSize: '12px', background: 'linear-gradient(90deg, #2563eb 0%, #1e40af 100%)', color: '#fff', border: 'none', borderRadius: '0.3rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 2px #0001', transition: 'background 0.2s', minWidth: '0' }}
                            onClick={() => analyzeGrammar(paragraph, index, language)}
                        >
                            解析
                        </button>
                        {analyses[language]?.[index] && analyses[language][index].map((entry, idx) => (
                            <button
                                key={idx}
                                style={{ margin: '2px', padding: '2px 7px', fontSize: '12px', background: '#f3f4f6', color: '#232526', border: '1px solid #e5e7eb', borderRadius: '0.3rem', whiteSpace: 'nowrap', cursor: 'pointer', transition: 'background 0.2s', minWidth: '0' }}
                                onClick={() => showDetails({...entry, paragraphIndex: index }, language)}
                            >
                                {entry.unsandhied}
                            </button>
                        ))}
                    </div>
                    {details[language]?.paragraphIndex === index && (
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.5rem', fontSize: '12px', background: '#f9fafb', borderRadius: '0.4rem', overflow: 'hidden', boxShadow: '0 1px 2px #0001' }}>
                            <thead>
                                <tr>
                                    <th style={{ border: '1px solid #e5e7eb', padding: '5px', background: '#f3f4f6', color: '#232526' }}>属性</th>
                                    <th style={{ border: '1px solid #e5e7eb', padding: '5px', background: '#f3f4f6', color: '#232526' }}>值</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ border: '1px solid #e5e7eb', padding: '5px' }}>Lemma</td>
                                    <td
                                        style={{ border: '1px solid #e5e7eb', padding: '5px', cursor: 'pointer' }}
                                        onSelect={() => {
                                            const selectedText = window.getSelection().toString();
                                            const range = window.getSelection().getRangeAt(0);
                                            const rect = range.getBoundingClientRect();
                                            const position = {
                                                left: rect.left + window.scrollX,
                                                top: rect.top + window.scrollY
                                            };
                                            handleSelection(selectedText, language, index, position);
                                        }}
                                    >
                                        {details[language].lemma}
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ border: '1px solid #e5e7eb', padding: '5px' }}>Tag</td>
                                    <td style={{ border: '1px solid #e5e7eb', padding: '5px' }}>{details[language].tag}</td>
                                </tr>
                                <tr>
                                    <td style={{ border: '1px solid #e5e7eb', padding: '5px' }}>Meanings</td>
                                    <td style={{ border: '1px solid #e5e7eb', padding: '5px' }}>{details[language].meanings.join(', ')}</td>
                                </tr>
                            </tbody>
                        </table>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.3rem', gap: '4px', flexWrap: 'wrap' }}>
                        <button
                            style={{ marginRight: '4px', padding: '2px 8px', fontSize: '12px', background: 'linear-gradient(90deg, #22c55e 0%, #15803d 100%)', color: '#fff', border: 'none', borderRadius: '0.3rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 2px #0001', transition: 'background 0.2s', minWidth: '0' }}
                            onClick={() => getTranslation(paragraph, index, language)}
                        >
                            翻译
                        </button>
                        <div style={{ fontStyle: 'italic', flex: 1, minWidth: 0 }} id="TranslationDiv">
                            <span
                                contentEditable
                                suppressContentEditableWarning
                                style={{
                                    display: 'block',
                                    padding: '3px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '0.2rem',
                                    fontSize: '13px',
                                    marginBottom: '0.3rem',
                                    outline: 'none',
                                    cursor: 'text',
                                    background: '#f9fafb',
                                    minHeight: '1.5em',
                                    transition: 'border 0.2s',
                                    minWidth: 0
                                }}
                                onBlur={(e) => {
                                    const updatedTranslations = {...translations };
                                    if (!updatedTranslations[language]) updatedTranslations[language] = {};
                                    if (!updatedTranslations[language][index]) updatedTranslations[language][index] = {};
                                    updatedTranslations[language][index].english = e.target.textContent;
                                    setTranslations(updatedTranslations);
                                }}
                                onSelect={() => {
                                    const selectedText = window.getSelection().toString();
                                    const range = window.getSelection().getRangeAt(0);
                                    const rect = range.getBoundingClientRect();
                                    const position = {
                                        left: rect.left + window.scrollX,
                                        top: rect.top + window.scrollY
                                    };
                                    handleSelection(selectedText, language, index, position);
                                }}
                            >
                                {translations[language]?.[index]?.english || "点击翻译按钮获取英文结果"}
                            </span>
                            <span
                                contentEditable
                                suppressContentEditableWarning
                                style={{
                                    display: 'block',
                                    padding: '3px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '0.2rem',
                                    fontSize: '13px',
                                    outline: 'none',
                                    cursor: 'text',
                                    background: '#f9fafb',
                                    minHeight: '1.5em',
                                    transition: 'border 0.2s',
                                    minWidth: 0
                                }}
                                onBlur={(e) => {
                                    const updatedTranslations = {...translations };
                                    if (!updatedTranslations[language]) updatedTranslations[language] = {};
                                    if (!updatedTranslations[language][index]) updatedTranslations[language][index] = {};
                                    updatedTranslations[language][index].chinese = e.target.textContent;
                                    setTranslations(updatedTranslations);
                                }}
                                onSelect={() => {
                                    const selectedText = window.getSelection().toString();
                                    const range = window.getSelection().getRangeAt(0);
                                    const rect = range.getBoundingClientRect();
                                    const position = {
                                        left: rect.left + window.scrollX,
                                        top: rect.top + window.scrollY
                                    };
                                    handleSelection(selectedText, language, index, position);
                                }}
                            >
                                {translations[language]?.[index]?.chinese || "点击翻译按钮获取中文结果"}
                            </span>
                        </div>
                    </div>
                    <button
                        style={{ padding: '2px 8px', fontSize: '12px', width: '100%', background: '#f87171', color: '#fff', border: 'none', borderRadius: '0.3rem', fontWeight: 600, cursor: 'pointer', marginTop: '0.3rem', boxShadow: '0 1px 2px #0001', transition: 'background 0.2s', minWidth: '0' }}
                        onClick={() => {
                            const updatedParagraphs = paragraphs.filter((_, i) => i!== index);
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

        const fileName = prompt("请输入导出的文件名：", `${language}-export`);
        if (!fileName) {
            alert("导出已取消。");
            return;
        }

        const fileHandle = await window.showDirectoryPicker();

        // 导出 JSON 文件
        const jsonFile = await fileHandle.getFileHandle(`${fileName}.json`, { create: true });
        const jsonWritable = await jsonFile.createWritable();
        await jsonWritable.write(JSON.stringify(data, null, 2));
        await jsonWritable.close();

        // 导出中文翻译 TXT 文件
        const chineseText = paragraphs.map((_, index) => translations[language]?.[index]?.chinese || '').join('\n');
        const chineseFile = await fileHandle.getFileHandle(`${fileName}-chinese.txt`, { create: true });
        const chineseWritable = await chineseFile.createWritable();
        await chineseWritable.write(chineseText);
        await chineseWritable.close();

        // 导出英文翻译 TXT 文件
        const englishText = paragraphs.map((_, index) => translations[language]?.[index]?.english || '').join('\n');
        const englishFile = await fileHandle.getFileHandle(`${fileName}-english.txt`, { create: true });
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
                    
                    
                } catch {
                    alert('导入的文件格式不正确，请选择正确的 JSON 文件。');
                }
            };
            reader.readAsText(file);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && popupData.isOpen) {
                setIsCtrlPressed(true);
                handleQuery();
            }
        };

        const handleKeyUp = (e) => {
            if (!e.ctrlKey) {
                setIsCtrlPressed(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        const handleScroll = () => {
            if (popupData.isOpen) {
                const range = window.getSelection().getRangeAt(0);
                const rect = range.getBoundingClientRect();
                const newPosition = {
                    left: rect.left + window.scrollX,
                    top: rect.bottom + window.scrollY + 5 
                };
                setPopupData(prev => ({...prev, position: newPosition }));
            }
        };

        window.addEventListener('scroll', handleScroll);

        document.addEventListener('selectionchange', handleSelectionChange);
        
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
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('selectionchange', handleSelectionChange);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [sanskritText, tibetanText, chineseText, popupData.isOpen, handleQuery, handleSelectionChange]);

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: '#fff', borderRadius: '1rem', boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)', padding: '2rem 1.5rem', margin: '2rem 0' }}>
            <div style={{ flex: '1 1 33%', margin: '0 12px', display: 'flex', flexDirection: 'column', background: '#f9fafb', borderRadius: '0.75rem', boxShadow: '0 1px 4px #0001', padding: '1.2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#232526' }}>梵语</h2>
                <label style={{ cursor: 'pointer', marginBottom: '0.5rem', color: '#2563eb', fontWeight: 600 }}>
                    导入json文件
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                    <label htmlFor="sanskritFileInput" style={{
                        display: 'inline-block',
                        padding: '4px 16px',
                        background: 'linear-gradient(90deg, #2563eb 0%, #1e40af 100%)',
                        color: '#fff',
                        borderRadius: '0.4rem',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: 'pointer',
                        boxShadow: '0 1px 2px #0001',
                        border: 'none',
                        marginBottom: 0
                    }}>
                        选择json文件
                    </label>
                    <span style={{ fontSize: '12px', color: '#666', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sanskritFileName}</span>
                    <input
                        id="sanskritFileInput"
                        type="file"
                        accept="application/json"
                        style={{ display: 'none' }}
                        onChange={e => {
                            setSanskritFileName(e.target.files[0]?.name || "");
                            handleJsonUpload(e, onSanskritChange, "sanskrit");
                        }}
                    />
                </div>
                <button
                    style={{ marginBottom: '1rem', padding: '8px', fontSize: '14px', background: 'linear-gradient(90deg, #2563eb 0%, #1e40af 100%)', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 4px #0001' }}
                    onClick={() => exportToJson(sanskritText, translations, 'sanskrit')}
                >
                    导出梵语
                </button>
                {formatText(sanskritText, onSanskritChange, 'sanskrit', sanskritRefs)}
            </div>
            <div style={{ flex: '1 1 33%', margin: '0 12px', display: 'flex', flexDirection: 'column', background: '#f9fafb', borderRadius: '0.75rem', boxShadow: '0 1px 4px #0001', padding: '1.2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#232526' }}>藏语</h2>
                <label style={{ cursor: 'pointer', marginBottom: '0.5rem', color: '#22c55e', fontWeight: 600 }}>
                    导入json文件
                </label>
                <input
                    type="file"
                    accept="application/json"
                    style={{ marginBottom: '1rem' }}
                    onChange={(e) => handleJsonUpload(e, onTibetanChange, 'tibetan')}
                />
                <button
                    style={{ marginBottom: '1rem', padding: '8px', fontSize: '14px', background: 'linear-gradient(90deg, #22c55e 0%, #15803d 100%)', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 4px #0001' }}
                    onClick={() => exportToJson(tibetanText, translations, 'tibetan')}
                >
                    导出藏语
                </button>
                {formatText(tibetanText, onTibetanChange, 'tibetan', tibetanRefs)}
            </div>
            <div style={{ flex: '1 1 33%', margin: '0 12px', display: 'flex', flexDirection: 'column', background: '#f9fafb', borderRadius: '0.75rem', boxShadow: '0 1px 4px #0001', padding: '1.2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#232526' }}>汉语或其他语言</h2>
                <label style={{ cursor: 'pointer', marginBottom: '0.5rem', color: '#fde047', fontWeight: 600 }}>
                    导入json文件
                </label>
                <input
                    type="file"
                    accept="application/json"
                    style={{ marginBottom: '1rem' }}
                    onChange={(e) => handleJsonUpload(e, onChineseChange, 'chinese')}
                />
                <button
                    style={{ marginBottom: '1rem', padding: '8px', fontSize: '14px', background: 'linear-gradient(90deg, #fde047 0%, #facc15 100%)', color: '#232526', border: 'none', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 4px #0001' }}
                    onClick={() => exportToJson(chineseText, translations, 'chinese')}
                >
                    导出汉语
                </button>
                {formatText(chineseText, onChineseChange, 'chinese', chineseRefs)}
            </div>
            {popupData.isOpen && (
                <div
                    id="popup-window"
                    style={{
                        position: 'absolute',
                        left: popupData.position.left,
                        top: popupData.position.top,
                        zIndex: 1000,
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        padding: '8px 16px',
                        borderRadius: '0.5rem',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)'
                    }}
                >
                    <p style={{ margin: 0, color: '#2563eb', fontWeight: 600 }}>{isCtrlPressed ? '松开 Ctrl 执行查询' : '按 Ctrl 查询'}</p>
                </div>
            )}
        </div>
    );
};

export default ReadingArea;