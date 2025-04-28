import React from 'react';

const Navbar = ({ onImportSanskrit, onImportTibetan, onImportChinese }) => {
    return (
        <nav className="bg-gray-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-white text-xl font-bold">梵藏汉阅读器</h1>
                <div className="flex space-x-4">
                    <input
                        type="file"
                        accept=".txt,.pdf"
                        className="hidden"
                        id="sanskrit-file"
                        onChange={(e) => onImportSanskrit(e.target.files[0])}
                    />
                    <label htmlFor="sanskrit-file" className="text-white bg-blue-500 hover:bg-blue-700 py-2 px-4 rounded cursor-pointer">
                        导入梵语文件
                    </label>
                    <input
                        type="file"
                        accept=".txt,.pdf"
                        className="hidden"
                        id="tibetan-file"
                        onChange={(e) => onImportTibetan(e.target.files[0])}
                    />
                    <label htmlFor="tibetan-file" className="text-white bg-green-500 hover:bg-green-700 py-2 px-4 rounded cursor-pointer">
                        导入藏语文件
                    </label>
                    <input
                        type="file"
                        accept=".txt,.pdf"
                        className="hidden"
                        id="chinese-file"
                        onChange={(e) => onImportChinese(e.target.files[0])}
                    />
                    <label htmlFor="chinese-file" className="text-white bg-yellow-500 hover:bg-yellow-700 py-2 px-4 rounded cursor-pointer">
                        导入汉语文件
                    </label>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;    