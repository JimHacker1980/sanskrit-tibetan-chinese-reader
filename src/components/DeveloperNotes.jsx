import React from 'react';

const DeveloperNotes = () => {
    return (
        <div style={{ margin: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h2>开发者的话</h2>
            <p>欢迎使用 Sanskrit-Tibetan-Chinese Reader！</p>
            <p>此项目旨在帮助用户更方便地阅读和翻译梵语、藏语和汉语文本。</p>
            <p>本项目采用了dharmamitra的接口，其中梵语支持语法分析和翻译，其他语言支持翻译。</p>
            <p>本网页与dharmamitra.org的区别在于，本网页旨在提供一个梵藏汉翻译的平台，可以服务于研究。</p>
            <p>这体现在可以导入导出文件，保留每次结果。这是像我这种上梵语阅读课的人必备的。</p>
            <p>欢迎在https://github.com/JimHacker1980/sanskrit-tibetan-chinese-reader的issue区向开发者提出各种需求！</p>
        </div>
    );
};

export default DeveloperNotes;
