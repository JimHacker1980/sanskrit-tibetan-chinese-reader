import React from 'react';
import MITRA from '../assets/MITRA.png';
import Tsadra from '../assets/Tsadra.png';

const Navbar = ({ onImportSanskrit, onImportTibetan, onImportChinese }) => {
    return (
        <nav style={{ background: '#fff', padding: '1.2rem 0', boxShadow: '0 2px 12px 0 rgba(0,0,0,0.06)' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '0.5rem', width: '100%', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <h1 style={{ color: '#232526', fontSize: '2.8rem', fontWeight: 700, letterSpacing: '0.1em', margin: 0, textShadow: '1px 1px 8px #fff8' }}>梵藏汉阅读器</h1>
                        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '1.5rem', gap: '0.75rem' }}>
                            <img src={MITRA} alt="MITRA" style={{ height: '4.2rem', width: 'auto', borderRadius: '0.5rem', boxShadow: '0 2px 8px #0001' }} />
                            <img src={Tsadra} alt="Tsadra" style={{ height: '4.2rem', width: 'auto', borderRadius: '0.5rem', boxShadow: '0 2px 8px #0001' }} />
                        </div>
                    </div>
                    <p style={{ color: '#232526', fontSize: '1.1rem', fontWeight: 500, margin: 0, opacity: 0.85 }}>由Dharmamitra.org和Tsadra Foundation支持</p>
                </div>
                <div style={{ display: 'flex', gap: '1.2rem', marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}>
                    <input
                        type="file"
                        accept=".txt,.pdf"
                        style={{ display: 'none' }}
                        id="sanskrit-file"
                        onChange={(e) => onImportSanskrit(e.target.files[0])}
                    />
                    <label htmlFor="sanskrit-file" style={{ color: '#fff', background: 'linear-gradient(90deg, #2563eb 0%, #1e40af 100%)', padding: '0.5rem 1.2rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', boxShadow: '0 1px 4px #0001', transition: 'background 0.2s' }}>
                        导入梵语文件
                    </label>
                    <input
                        type="file"
                        accept=".txt,.pdf"
                        style={{ display: 'none' }}
                        id="tibetan-file"
                        onChange={(e) => onImportTibetan(e.target.files[0])}
                    />
                    <label htmlFor="tibetan-file" style={{ color: '#fff', background: 'linear-gradient(90deg, #22c55e 0%, #15803d 100%)', padding: '0.5rem 1.2rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', boxShadow: '0 1px 4px #0001', transition: 'background 0.2s' }}>
                        导入藏语文件
                    </label>
                    <input
                        type="file"
                        accept=".txt,.pdf"
                        style={{ display: 'none' }}
                        id="chinese-file"
                        onChange={(e) => onImportChinese(e.target.files[0])}
                    />
                    <label htmlFor="chinese-file" style={{ color: '#232526', background: 'linear-gradient(90deg, #fde047 0%, #facc15 100%)', padding: '0.5rem 1.2rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', boxShadow: '0 1px 4px #0001', transition: 'background 0.2s' }}>
                        导入汉语文件
                    </label>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;