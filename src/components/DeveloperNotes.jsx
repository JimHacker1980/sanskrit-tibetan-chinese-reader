import React from 'react';

const DeveloperNotes = () => {
    return (
        <div style={{ margin: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <h2>开发者的话</h2>
            <p>欢迎使用 Sanskrit-Tibetan-Chinese Reader！</p>
            <p>此项目旨在帮助用户更方便地阅读和翻译梵语、藏语和汉语文本。</p>
            <p>本项目采用了dharmamitra的接口，其中梵语支持语法分析和翻译，其他语言支持翻译</p>
            <p>本软件目前还只是一个demo，欢迎在https://github.com/JimHacker1980/sanskrit-tibetan-chinese-reader的issue区向开发者提出各种需求！</p>
        </div>
    );
};

export default DeveloperNotes;
