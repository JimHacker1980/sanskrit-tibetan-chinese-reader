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
            <p>本网页的使用教程见https://www.bilibili.com/video/BV1RBGCzbEvM</p>
            <p>本网页支持修改翻译，使得翻译更加符合原意。</p>
            <p>值得注意的是，可以导出当前界面，点击“导出”按钮，可以得到一个.json文件，和两个中英文翻译txt文件。</p>
            <p>下次想要继续阅读，可以在“导入json”文件处导入上次导出的.json文件，这样可以加载文本和上次已经做好的翻译</p>
            <p>现在增加了跳转梵藏汉词典查词功能，请看我B站的下一条视频https://www.bilibili.com/video/BV1R5Ghz4EXw/。具体操作是用用鼠标选择文字后，按Ctrl跳转</p>
            <p>按Ctrl+W可以关闭新打开的词典界面，回到阅读界面。</p>
            <p>感谢所有提供接口和网页的开发者！感谢所有提供宝贵建议的使用者！</p>
            <p>很惭愧，我只是做了一点微小的整合工作。</p>
            <p>欢迎在https://github.com/JimHacker1980/sanskrit-tibetan-chinese-reader的issue区向开发者提出各种需求！</p>
        </div>
    );
};

export default DeveloperNotes;
