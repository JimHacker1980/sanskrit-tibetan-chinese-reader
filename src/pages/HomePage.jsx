import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import ReadingArea from '../components/ReadingArea';
import DeveloperNotes from '../components/DeveloperNotes';
import * as pdfjsLib from 'pdfjs-dist';

// 假设这是你的 OCR 接口地址
const OCR_API_URL = 'https://your-ocr-api-url.com';

const HomePage = () => {
    const [sanskritText, setSanskritText] = useState('');
    const [tibetanText, setTibetanText] = useState('');
    const [chineseText, setChineseText] = useState('');

    const readFile = async (file) => {
        if (file.type === 'text/plain') {
            const reader = new FileReader();
            return await new Promise((resolve) => {
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsText(file);
            });
        } else if (file.type === 'application/pdf') {
            const useOCR = window.confirm('是否使用 OCR 识别 PDF 内容？');
            if (useOCR) {
                try {
                    const formData = new FormData();
                    formData.append('file', file);

                    const response = await fetch(OCR_API_URL, {
                        method: 'POST',
                        body: formData
                    });

                    if (!response.ok) {
                        throw new Error('OCR 请求失败');
                    }

                    const data = await response.json();
                    return data.text;
                } catch (error) {
                    console.error('OCR 错误:', error);
                    return 'OCR 识别失败';
                }
            } else {
                const loadingTask = pdfjsLib.getDocument(URL.createObjectURL(file));
                const pdf = await loadingTask.promise;
                let text = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    text += content.items.map(item => item.str).join(' ');
                }
                return text;
            }
        }
    };

    const onImportSanskrit = async (file) => {
        if (file) {
            const text = await readFile(file);
            setSanskritText(text);
        }
    };

    const onImportTibetan = async (file) => {
        if (file) {
            const text = await readFile(file);
            setTibetanText(text);
        }
    };

    const onImportChinese = async (file) => {
        if (file) {
            const text = await readFile(file);
            setChineseText(text);
        }
    };

    const onSanskritChange = (newText) => {
        setSanskritText(newText);
    };

    const onTibetanChange = (newText) => {
        setTibetanText(newText);
    };

    const onChineseChange = (newText) => {
        setChineseText(newText);
    };

    return (
        <div>
            <Navbar
                onImportSanskrit={onImportSanskrit}
                onImportTibetan={onImportTibetan}
                onImportChinese={onImportChinese}
            />
            <ReadingArea
                sanskritText={sanskritText}
                tibetanText={tibetanText}
                chineseText={chineseText}
                onSanskritChange={onSanskritChange}
                onTibetanChange={onTibetanChange}
                onChineseChange={onChineseChange}
            />
            <DeveloperNotes />
        </div>
    );
};

export default HomePage;