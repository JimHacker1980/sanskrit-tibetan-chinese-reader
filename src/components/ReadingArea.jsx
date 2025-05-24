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
    const [tibetanFileName, setTibetanFileName] = useState("");
    const [chineseFileName, setChineseFileName] = useState("");

    const sanskritRefs = useRef([]);
    const tibetanRefs = useRef([]);
    const chineseRefs = useRef([]);

    const [showTxtDropdown, setShowTxtDropdown] = useState(false);
    const [showTibetanTxtDropdown, setShowTibetanTxtDropdown] = useState(false);
    const [showChineseTxtDropdown, setShowChineseTxtDropdown] = useState(false);
    const [sanskritTxtList, setSanskritTxtList] = useState([]);
    const [tibetanTxtList, setTibetanTxtList] = useState([]);
    const [chineseTxtList, setChineseTxtList] = useState([]);
    const [sanskritLoading, setSanskritLoading] = useState(false);
    const [tibetanLoading, setTibetanLoading] = useState(false);
    const [chineseLoading, setChineseLoading] = useState(false);

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
            <div key={index} style={{ marginBottom: '1rem', border: '1px solid #ccc', padding: '8px' }}>
                <div ref={(el) => refs.current[index] = el}>
                    <textarea
                        style={{
                            resize: 'none',
                            border: '1px solid #ccc',
                            padding: '8px',
                            fontSize: '19px',
                            fontFamily: 'Times New Roman, sans-serif',
                            width: '100%',
                            marginBottom: '1rem',
                            overflow: 'hidden',
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
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                            style={{ marginRight: '8px', padding: '4px 8px', fontSize: '12px', background: 'linear-gradient(90deg, #2563eb 0%, #1e40af 100%)', color: '#fff', border: 'none', borderRadius: '0.3rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 2px #0001', transition: 'background 0.2s' }}
                            onClick={() => analyzeGrammar(paragraph, index, language)}
                        >
                            解析
                        </button>
                        {analyses[language]?.[index] && analyses[language][index].map((entry, idx) => (
                            <button
                                key={idx}
                                style={{ margin: '4px', padding: '4px 8px', fontSize: '12px', background: '#f3f4f6', color: '#232526', border: '1px solid #e5e7eb', borderRadius: '0.3rem', whiteSpace: 'nowrap', cursor: 'pointer', transition: 'background 0.2s' }}
                                onClick={() => showDetails({...entry, paragraphIndex: index }, language)}
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
                                    <td
                                        style={{ border: '1px solid #ccc', padding: '8px' }}
                                        onSelect={(e) => {
                                            const selectedText = window.getSelection().toString();
                                            const range = window.getSelection().getRangeAt(0);
                                            const rect = range.getBoundingClientRect();
                                            const position = {
                                                left: rect.left + window.scrollX,
                                                top: rect.top + window.scrollY + 5
                                            };
                                            handleSelection(selectedText, language, index, position);
                                        }}
                                    >
                                        {details[language].lemma}
                                    </td>
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
                            style={{ marginRight: '8px', padding: '4px 8px', fontSize: '12px', background: 'linear-gradient(90deg, #22c55e 0%, #15803d 100%)', color: '#fff', border: 'none', borderRadius: '0.3rem', fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 2px #0001', transition: 'background 0.2s' }}
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
                                    const updatedTranslations = {...translations };
                                    if (!updatedTranslations[language]) updatedTranslations[language] = {};
                                    if (!updatedTranslations[language][index]) updatedTranslations[language][index] = {};
                                    updatedTranslations[language][index].english = e.target.textContent;
                                    setTranslations(updatedTranslations);
                                }}
                                onSelect={(e) => {
                                    const selectedText = window.getSelection().toString();
                                    const range = window.getSelection().getRangeAt(0);
                                    const rect = range.getBoundingClientRect();
                                    const position = {
                                        left: rect.left + window.scrollX,
                                        top: rect.top + window.scrollY + 40
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
                                    padding: '4px',
                                    border: '1px solid transparent',
                                    fontSize: '14px',
                                    outline: 'none',
                                    cursor: 'text',
                                }}
                                onBlur={(e) => {
                                    const updatedTranslations = {...translations };
                                    if (!updatedTranslations[language]) updatedTranslations[language] = {};
                                    if (!updatedTranslations[language][index]) updatedTranslations[language][index] = {};
                                    updatedTranslations[language][index].chinese = e.target.textContent;
                                    setTranslations(updatedTranslations);
                                }}
                                onSelect={(e) => {
                                    const selectedText = window.getSelection().toString();
                                    const range = window.getSelection().getRangeAt(0);
                                    const rect = range.getBoundingClientRect();
                                    const position = {
                                        left: rect.left + window.scrollX,
                                        top: rect.top + window.scrollY + 35
                                    };
                                    handleSelection(selectedText, language, index, position);
                                }}
                            >
                                {translations[language]?.[index]?.chinese || "点击翻译按钮获取中文结果"}
                            </span>
                        </div>
                    </div>
                    <button
                        style={{ padding: '4px 8px', fontSize: '12px', width: '100%', background: '#fff', color: 'rgb(137, 134, 134)', border: '1px solid rgb(221, 208, 208)', borderRadius: '0.3rem', fontWeight: 600, cursor: 'pointer', marginTop: '0.3rem', boxShadow: '0 1px 2px #0001', transition: 'background 0.2s, color 0.2s, border 0.2s' }}
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
                    
                    
                } catch (error) {
                    alert('导入的文件格式不正确，请选择正确的 JSON 文件。');
                }
            };
            reader.readAsText(file);
        }
    };

    // 获取远程 txt 列表
const fetchTxtList = async (lang) => {
  let url = '';
  if (lang === 'sanskrit') url = '/api/sanskrit-txts';
  if (lang === 'tibetan') url = '/api/tibetan-txts';
  if (lang === 'chinese') url = '/api/chinese-txts';
  try {
    if (lang === 'sanskrit') setSanskritLoading(true);
    if (lang === 'tibetan') setTibetanLoading(true);
    if (lang === 'chinese') setChineseLoading(true);
    const res = await fetch(url);
    const data = await res.json();
    if (lang === 'sanskrit') setSanskritTxtList(data);
    if (lang === 'tibetan') setTibetanTxtList(data);
    if (lang === 'chinese') setChineseTxtList(data);
  } catch (e) {
    alert('获取远程列表失败');
  } finally {
    if (lang === 'sanskrit') setSanskritLoading(false);
    if (lang === 'tibetan') setTibetanLoading(false);
    if (lang === 'chinese') setChineseLoading(false);
  }
};

// 获取远程 txt 内容
const fetchTxtContent = async (url, onChange, closeDropdown) => {
  try {
    // 只允许 fetch public 目录下的资源（以 / 开头）
    if (!url.startsWith('/')) {
      alert('仅支持读取本地 public 目录下的 txt 文件，远程资源请通过代理或后端转发获取。');
      return;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error('网络错误');
    const txt = await res.text();
    onChange(txt);
    closeDropdown(false);
  } catch (e) {
    alert('获取文本内容失败');
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
    }, [sanskritText, tibetanText, chineseText, popupData?popupData.isOpen:undefined]);

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: '1 1 33%', margin: '0 8px', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>梵语</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', position: 'relative' }}>
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
                  <div style={{ position: 'relative' }}>
                    <button
                      style={{
                        padding: '4px 12px',
                        background: showTxtDropdown
                          ? 'linear-gradient(90deg, #6366f1 0%, #2563eb 100%)'
                          : 'linear-gradient(90deg, #818cf8 0%, #2563eb 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '0.4rem',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: 'pointer',
                        boxShadow: showTxtDropdown
                          ? '0 2px 8px #6366f155, 0 1px 2px #0001'
                          : '0 1px 2px #0001',
                        marginLeft: '4px',
                        marginRight: '4px',
                        outline: showTxtDropdown ? '2px solid #6366f1' : 'none',
                        position: 'relative',
                        zIndex: 2,
                        transition: 'background 0.2s, box-shadow 0.2s, outline 0.2s'
                      }}
                      onClick={() => {
                        setShowTxtDropdown(v => !v);
                        if (!showTxtDropdown && sanskritTxtList.length === 0) fetchTxtList('sanskrit');
                      }}
                    >
                      从仓库导入
                    </button>
                    {showTxtDropdown && (
                      <div style={{
                        position: 'absolute',
                        top: '110%',
                        left: 0,
                        background: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.4rem',
                        boxShadow: '0 2px 8px #0002',
                        minWidth: '180px',
                        zIndex: 10
                      }}>
                        {sanskritLoading ? <div style={{padding:'8px 16px'}}>加载中...</div> :
                          (sanskritTxtList.length === 0 ? <div style={{padding:'8px 16px'}}>暂无数据</div> :
                            sanskritTxtList.map((file, idx) => (
                              <div
                                key={file.name}
                                style={{
                                  padding: '8px 16px',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                  color: '#232526',
                                  background: idx % 2 === 0 ? '#f3f4f6' : '#fff',
                                  borderBottom: idx === sanskritTxtList.length - 1 ? 'none' : '1px solid #e5e7eb',
                                  borderRadius: idx === 0 ? '0.4rem 0.4rem 0 0' : idx === sanskritTxtList.length - 1 ? '0 0 0.4rem 0.4rem' : '0'
                                }}
                                onClick={() => fetchTxtContent(file.url, onSanskritChange, setShowTxtDropdown)}
                              >
                                {file.name}
                              </div>
                            ))
                          )
                        }
                      </div>
                    )}
                  </div>
                </div>
                <button
                    style={{
                        marginBottom: '1rem',
                        padding: '8px 0',
                        fontSize: '15px',
                        background: 'linear-gradient(90deg, #2563eb 0%, #1e40af 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 1px 4px #0001',
                        letterSpacing: '1px',
                        transition: 'background 0.2s',
                        width: '100%',
                        outline: 'none',
                        textAlign: 'center',
                        lineHeight: 1.5
                    }}
                    onClick={() => exportToJson(sanskritText, translations, 'sanskrit')}
                >
                    导出梵语
                </button>
                {formatText(sanskritText, onSanskritChange, 'sanskrit', sanskritRefs)}
            </div>
            <div style={{ flex: '1 1 33%', margin: '0 8px', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>藏语</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                  <label htmlFor="tibetanFileInput" style={{
                    display: 'inline-block',
                    padding: '4px 16px',
                    background: 'linear-gradient(90deg, #22c55e 0%, #15803d 100%)',
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
                  <span style={{ fontSize: '12px', color: '#666', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tibetanFileName}</span>
                  <input
                    id="tibetanFileInput"
                    type="file"
                    accept="application/json"
                    style={{ display: 'none' }}
                    onChange={e => {
                      setTibetanFileName(e.target.files[0]?.name || "");
                      handleJsonUpload(e, onTibetanChange, "tibetan");
                    }}
                  />
                  <div style={{ position: 'relative' }}>
                    <button
                      style={{
                        padding: '4px 12px',
                        background: showTibetanTxtDropdown
                          ? 'linear-gradient(90deg, #22d3ee 0%, #22c55e 100%)'
                          : 'linear-gradient(90deg, #6ee7b7 0%, #22c55e 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '0.4rem',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: 'pointer',
                        boxShadow: showTibetanTxtDropdown
                          ? '0 2px 8px #22d3ee55, 0 1px 2px #0001'
                          : '0 1px 2px #0001',
                        marginLeft: '4px',
                        marginRight: '4px',
                        outline: showTibetanTxtDropdown ? '2px solid #22d3ee' : 'none',
                        position: 'relative',
                        zIndex: 2,
                        transition: 'background 0.2s, box-shadow 0.2s, outline 0.2s'
                      }}
                      onClick={() => {
                        setShowTibetanTxtDropdown(v => !v);
                        if (!showTibetanTxtDropdown && tibetanTxtList.length === 0) fetchTxtList('tibetan');
                      }}
                    >
                      从仓库导入
                    </button>
                    {showTibetanTxtDropdown && (
                      <div style={{
                        position: 'absolute',
                        top: '110%',
                        left: 0,
                        background: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.4rem',
                        boxShadow: '0 2px 8px #0002',
                        minWidth: '180px',
                        zIndex: 10
                      }}>
                        {tibetanLoading ? <div style={{padding:'8px 16px'}}>加载中...</div> :
                          (tibetanTxtList.length === 0 ? <div style={{padding:'8px 16px'}}>暂无数据</div> :
                            tibetanTxtList.map((file, idx) => (
                              <div
                                key={file.name}
                                style={{
                                  padding: '8px 16px',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                  color: '#232526',
                                  background: idx % 2 === 0 ? '#f3f4f6' : '#fff',
                                  borderBottom: idx === tibetanTxtList.length - 1 ? 'none' : '1px solid #e5e7eb',
                                  borderRadius: idx === 0 ? '0.4rem 0.4rem 0 0' : idx === tibetanTxtList.length - 1 ? '0 0 0.4rem 0.4rem' : '0'
                                }}
                                onClick={() => fetchTxtContent(file.url, onTibetanChange, setShowTibetanTxtDropdown)}
                              >
                                {file.name}
                              </div>
                            ))
                          )
                        }
                      </div>
                    )}
                  </div>
                </div>
                <button
                    style={{
                        marginBottom: '1rem',
                        padding: '8px 0',
                        fontSize: '15px',
                        background: 'linear-gradient(90deg, #22c55e 0%, #15803d 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 1px 4px #0001',
                        letterSpacing: '1px',
                        transition: 'background 0.2s',
                        width: '100%',
                        outline: 'none',
                        textAlign: 'center',
                        lineHeight: 1.5
                    }}
                    onClick={() => exportToJson(tibetanText, translations, 'tibetan')}
                >
                    导出藏语
                </button>
                {formatText(tibetanText, onTibetanChange, 'tibetan', tibetanRefs)}
            </div>
            <div style={{ flex: '1 1 33%', margin: '0 8px', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', textAlign: 'center' }}>汉语或其他语言</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                  <label htmlFor="chineseFileInput" style={{
                    display: 'inline-block',
                    padding: '4px 16px',
                    background: 'linear-gradient(90deg, #fde047 0%, #facc15 100%)',
                    color: '#232526',
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
                  <span style={{ fontSize: '12px', color: '#666', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chineseFileName}</span>
                  <input
                    id="chineseFileInput"
                    type="file"
                    accept="application/json"
                    style={{ display: 'none' }}
                    onChange={e => {
                      setChineseFileName(e.target.files[0]?.name || "");
                      handleJsonUpload(e, onChineseChange, "chinese");
                    }}
                  />
                  <div style={{ position: 'relative' }}>
                    <button
                      style={{
                        padding: '4px 12px',
                        background: showChineseTxtDropdown
                          ? 'linear-gradient(90deg, #fde047 0%, #fbbf24 100%)'
                          : 'linear-gradient(90deg, #fde047 0%, #facc15 100%)',
                        color: '#232526',
                        border: 'none',
                        borderRadius: '0.4rem',
                        fontWeight: 600,
                        fontSize: '13px',
                        cursor: 'pointer',
                        boxShadow: showChineseTxtDropdown
                          ? '0 2px 8px #fde04755, 0 1px 2px #0001'
                          : '0 1px 2px #0001',
                        marginLeft: '4px',
                        marginRight: '4px',
                        outline: showChineseTxtDropdown ? '2px solid #fde047' : 'none',
                        position: 'relative',
                        zIndex: 2,
                        transition: 'background 0.2s, box-shadow 0.2s, outline 0.2s'
                      }}
                      onClick={() => {
                        setShowChineseTxtDropdown(v => !v);
                        if (!showChineseTxtDropdown && chineseTxtList.length === 0) fetchTxtList('chinese');
                      }}
                    >
                      从仓库导入
                    </button>
                    {showChineseTxtDropdown && (
                      <div style={{
                        position: 'absolute',
                        top: '110%',
                        left: 0,
                        background: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.4rem',
                        boxShadow: '0 2px 8px #0002',
                        minWidth: '180px',
                        zIndex: 10
                      }}>
                        {chineseLoading ? <div style={{padding:'8px 16px'}}>加载中...</div> :
                          (chineseTxtList.length === 0 ? <div style={{padding:'8px 16px'}}>暂无数据</div> :
                            chineseTxtList.map((file, idx) => (
                              <div
                                key={file.name}
                                style={{
                                  padding: '8px 16px',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                  color: '#232526',
                                  background: idx % 2 === 0 ? '#f3f4f6' : '#fff',
                                  borderBottom: idx === chineseTxtList.length - 1 ? 'none' : '1px solid #e5e7eb',
                                  borderRadius: idx === 0 ? '0.4rem 0.4rem 0 0' : idx === chineseTxtList.length - 1 ? '0 0 0.4rem 0.4rem' : '0'
                                }}
                                onClick={() => fetchTxtContent(file.url, onChineseChange, setShowChineseTxtDropdown)}
                              >
                                {file.name}
                              </div>
                            ))
                          )
                        }
                      </div>
                    )}
                  </div>
                </div>
                <button
                    style={{
                        marginBottom: '1rem',
                        padding: '8px 0',
                        fontSize: '15px',
                        background: 'linear-gradient(90deg, #fde047 0%, #facc15 100%)',
                        color: '#232526',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 1px 4px #0001',
                        letterSpacing: '1px',
                        transition: 'background 0.2s',
                        width: '100%',
                        outline: 'none',
                        textAlign: 'center',
                        lineHeight: 1.5
                    }}
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
                        padding: '8px',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    <p>{isCtrlPressed ? '松开 Ctrl 执行查询' : '按 Ctrl 查询'}</p>
                </div>
            )}
        </div>
    );
};

export default ReadingArea;