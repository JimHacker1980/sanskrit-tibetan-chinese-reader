import React from 'react';
import MITRA from '../assets/MITRA.png';
import Tsadra from '../assets/Tsadra.png';

const Navbar = ({ onImportSanskrit, onImportTibetan, onImportChinese }) => {
    return (
        <nav className="bg-gray-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <div style={{ display: 'flex', alignItems: 'center', borderBottom: '2px solid #ccc', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                    <h1 style={{ color: 'black', fontSize: '3.25rem', fontWeight: 'bold'}}>梵藏汉阅读器</h1>
                    <div style={{ display: 'flex', alignItems: 'center', marginLeft: '1rem', gap: '0.5rem' }}>
                        <img src={MITRA} alt="MITRA" style={{ height: '5rem', width: 'auto' }} />
                        <img src={Tsadra} alt="Tsadra" style={{ height: '5rem', width: 'auto' }} />
                    </div>
                </div>
                <p style={{ color: 'black', fontSize: '1.25rem'}}>由Dharmamitra.org和Tsadra Foundation支持</p>

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