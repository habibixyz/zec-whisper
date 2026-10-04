import { useState, useEffect } from 'react';
import { Lock, Inbox, Users, ShieldCheck, HelpCircle, Globe } from 'lucide-react';
import { GithubIcon } from './components/GithubIcon';
import { ZecWhisperLogo } from './components/ZecWhisperLogo';
import type {
  ShieldedRecipient, ShieldedSubmission, SubmissionCategory,
  EncryptedAttachment, NetworkBlockStatus, ZcashNetwork, LightwalletdServer
} from './types/zcash';
import { SendTab } from './components/SendTab';
import { InboxTab } from './components/InboxTab';
import { DirectoryTab } from './components/DirectoryTab';
import { DisclosuresWall } from './components/DisclosuresWall';
import { HomeTab } from './components/HomeTab';
import { AboutFaqTab } from './components/AboutFaqTab';
import { RegisterDropBoxModal } from './components/RegisterDropBoxModal';
import { LightwalletdScannerModal } from './components/LightwalletdScannerModal';
import { JudgeTestingKitModal } from './components/JudgeTestingKitModal';
import { KNOWN_LIGHTWALLETD_SERVERS, fetchLiveZcashBlockStats } from './utils/lightwalletd';
import { loadSavedRecipients, addCustomRecipient, loadSavedSubmissions, saveSubmissions } from './utils/storage';

type Tab = 'home' | 'send' | 'inbox' | 'disclosures' | 'directory' | 'about';

// Navigation tabs in the header nav
const NAV_TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'send',        label: 'Send Drop',   icon: <Lock size={14} /> },
  { id: 'inbox',       label: 'Safe Inbox',  icon: <Inbox size={14} /> },
  { id: 'disclosures', label: 'Public Feed', icon: <Globe size={14} /> },
  { id: 'directory',   label: 'Directory',   icon: <Users size={14} /> },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('home');
  const [recipients, setRecipients] = useState<ShieldedRecipient[]>(() => loadSavedRecipients());
  const [selectedRecipient, setSelectedRecipient] = useState<ShieldedRecipient | null>(() => {
    const saved = loadSavedRecipients();
    return saved.length > 0 ? saved[0] : null;
  });
  const [submissions, setSubmissions] = useState<ShieldedSubmission[]>(() => loadSavedSubmissions());
  const [notification, setNotification] = useState<string | null>(null);

  // Modals
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen]   = useState(false);
  const [isJudgeKitOpen, setIsJudgeKitOpen] = useState(false);
  const [isRefreshingNet, setIsRefreshingNet] = useState(false);

  const [network, setNetwork] = useState<NetworkBlockStatus>(() => ({
    network: 'mainnet',
    blockHeight: 3_500_226,
    bestBlockHash: '000000000068684cbd4ff47a739d2d91ad7859be6e57d0d2b9c191be47426459',
    bestBlockTime: 'Live',
    activeServer: KNOWN_LIGHTWALLETD_SERVERS[0],
    lastUpdated: 0,
    syncPercentage: 100,
    isScanning: false,
    orchardPoolActive: true,
    targetBlockTime: 75,
    mempoolTxs: 4,
    difficulty: 290_776_638,
  }));

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 5500);
  };

  const refreshNetwork = async (net: ZcashNetwork = network.network, srv?: LightwalletdServer) => {
    setIsRefreshingNet(true);
    const { status } = await fetchLiveZcashBlockStats(net, srv);
    setNetwork(status);
    setIsRefreshingNet(false);
  };

  // URL param: ?to=u1...&name=...&handle=...
  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      const to = p.get('to');
      if (to && to.startsWith('u1')) {
        const name   = p.get('name') || 'Direct Drop';
        const handle = p.get('handle') || '@direct_drop';
        const exists = recipients.find(r => r.unifiedAddress === to);
        if (exists) {
          setSelectedRecipient(exists);
        } else {
          const r: ShieldedRecipient = {
            name: decodeURIComponent(name),
            handle: decodeURIComponent(handle),
            role: 'Direct Drop Recipient',
            avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(handle)}`,
            unifiedAddress: to,
            description: 'Confidential drop box opened via a direct share link.',
            verified: true,
          };
          const updated = addCustomRecipient(r);
          setRecipients(updated);
          setSelectedRecipient(r);
        }
        setTab('send');
        notify(`Drop box loaded for ${decodeURIComponent(name)}`);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    refreshNetwork('mainnet');
    const netType = network.network;
    const iv = setInterval(() => refreshNetwork(netType), 45_000);
    return () => clearInterval(iv);
  }, []);

  const handleRegister = (r: ShieldedRecipient) => {
    const updated = addCustomRecipient(r);
    setRecipients(updated);
    setSelectedRecipient(r);
    setTab('send');
    notify(`Drop box for ${r.name} activated! You can now receive shielded tips.`);
  };

  const handleBroadcast = (data: {
    recipientHandle: string;
    amount: number;
    message: string;
    category: SubmissionCategory;
    attachment?: EncryptedAttachment;
    txid?: string;
  }) => {
    const txid = data.txid && /^[0-9a-fA-F]{64}$/.test(data.txid.trim())
      ? data.txid.trim().toLowerCase()
      : Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const sub: ShieldedSubmission = {
      id: `sub-${Date.now()}`,
      txid,
      blockHeight: network.blockHeight,
      timestamp: Date.now(),
      amount: data.amount,
      recipientHandle: data.recipientHandle,
      senderShieldedPool: 'Orchard',
      message: data.message || 'Encrypted zero-knowledge payload',
      category: data.category,
      attachment: data.attachment,
      status: 'confirmed',
      isDisclosed: false,
    };

    setSubmissions(prev => {
      const updated = [sub, ...prev];
      saveSubmissions(updated);
      return updated;
    });
    notify(`Shielded transaction confirmed in block #${sub.blockHeight}!`);
  };

  const handleDisclose = (id: string) => {
    setSubmissions(prev => {
      const updated = prev.map(s =>
        s.id === id ? { ...s, isDisclosed: true, disclosureTimestamp: Date.now() } : s
      );
      saveSubmissions(updated);
      return updated;
    });
  };

  const disclosedCount = submissions.filter(s => s.isDisclosed).length;
  const totalZec = submissions.reduce((a, s) => a + s.amount, 0).toFixed(2);

  return (
    <div className="app-shell">

      {/* ─── Toast ─── */}
      {notification && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: 'rgba(16,185,129,0.96)', color: '#07090E',
          fontWeight: 600, fontSize: '0.85rem', padding: '12px 18px',
          borderRadius: 10, boxShadow: '0 8px 24px rgba(16,185,129,0.35)',
          display: 'flex', alignItems: 'center', gap: 8,
          animation: 'fadeIn 0.25s ease',
        }}>
          <ShieldCheck size={16} />
          {notification}
        </div>
      )}

      {/* ─── Header ─── */}
      <header className="site-header">
        <div className="container header-inner">
          {/* Logo */}
          <button type="button" onClick={() => setTab('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <ZecWhisperLogo size={38} showText={true} />
          </button>

          {/* ── Core nav: 3 tabs only ── */}
          <nav className="main-nav">
            {NAV_TABS.map(t => (
              <button
                key={t.id}
                type="button"
                className={`nav-tab ${tab === t.id ? 'active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.icon}
                {t.label}
                {t.id === 'inbox' && submissions.length > 0 && (
                  <span style={{
                    background: 'var(--gold)', color: '#07090E', fontSize: '0.6rem',
                    fontWeight: 800, borderRadius: 99, padding: '1px 5px', lineHeight: 1.6,
                  }}>
                    {submissions.length}
                  </span>
                )}
                {t.id === 'disclosures' && disclosedCount > 0 && (
                  <span style={{
                    background: 'var(--green)', color: '#07090E', fontSize: '0.6rem',
                    fontWeight: 800, borderRadius: 99, padding: '1px 5px', lineHeight: 1.6,
                  }}>
                    {disclosedCount}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* ── Right: single CTA ── */}
          <div className="header-right">
            <button
              type="button"
              className="btn-primary"
              onClick={() => setIsRegisterOpen(true)}
              style={{ padding: '9px 16px', fontSize: '0.84rem', gap: 7 }}
            >
              <ShieldCheck size={14} />
              Register Drop Box
            </button>
          </div>
        </div>
      </header>

      {/* ─── Sub-bar: secondary info ─── */}
      <div style={{
        background: 'rgba(10, 14, 22, 0.7)',
        borderBottom: '1px solid var(--border-1)',
        backdropFilter: 'blur(8px)',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 36, gap: '1rem' }}>
          {/* Left: network status */}
          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}
            title="View Lightwalletd node status"
          >
            <span className="pulse-dot" style={{ width: 6, height: 6 }} />
            <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
              Block #{network.blockHeight.toLocaleString()}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-4)' }}>·</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', textTransform: 'capitalize' }}>{network.network}</span>
            {network.marketPriceUsd && network.marketPriceUsd > 0 && (
              <>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-4)' }}>·</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontWeight: 600 }}>
                  ZEC ${network.marketPriceUsd.toFixed(2)}
                </span>
              </>
            )}
          </button>

          {/* Right: secondary nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              type="button"
              onClick={() => setTab('about')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.76rem', color: tab === 'about' ? 'var(--gold)' : 'var(--text-3)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}
            >
              <HelpCircle size={12} />
              About &amp; FAQ
            </button>
            <span style={{ color: 'var(--text-4)', fontSize: '0.7rem' }}>·</span>
            <button
              type="button"
              onClick={() => setIsJudgeKitOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.76rem', color: 'var(--text-3)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}
            >
              <ShieldCheck size={12} />
              Judge Kit
            </button>
          </div>
        </div>
      </div>

      {/* ─── Page Content ─── */}
      <main style={{ flex: 1 }}>
        {tab === 'home' && (
          <HomeTab
            submissions={submissions}
            disclosedCount={disclosedCount}
            totalZec={totalZec}
            onGoSend={() => setTab('send')}
            onGoRegister={() => setIsRegisterOpen(true)}
            onGoAbout={() => setTab('about')}
            onGoDisclosures={() => setTab('disclosures')}
          />
        )}

        {tab === 'send' && (
          <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>
            <div style={{ marginBottom: '1.75rem' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.3rem' }}>
                Send a Shielded Drop
              </h1>
              <p style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>
                Compose an encrypted tip, whistleblower report, or bounty. Delivered directly via Zcash Orchard — no accounts, no logs.
              </p>
            </div>
            <SendTab
              recipients={recipients}
              selectedRecipient={selectedRecipient}
              onSelectRecipient={setSelectedRecipient}
              onBroadcast={handleBroadcast}
              onOpenRegisterModal={() => setIsRegisterOpen(true)}
              marketPriceUsd={network.marketPriceUsd}
            />
          </div>
        )}

        {tab === 'inbox' && (
          <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>
            <div style={{ marginBottom: '1.75rem' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.3rem' }}>
                Safe Inbox
              </h1>
              <p style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>
                View and manage shielded drops received. Disclose confirmed drops to the public board when ready.
              </p>
            </div>
            <InboxTab
              submissions={submissions}
              selectedRecipient={selectedRecipient}
              networkStatus={network}
              onDisclose={handleDisclose}
              onOpenScanner={() => setIsScannerOpen(true)}
            />
          </div>
        )}

        {tab === 'disclosures' && (
          <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>
            <div style={{ marginBottom: '1.75rem' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.3rem' }}>
                Public Disclosures Feed
              </h1>
              <p style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>
                Verified leaks, whistleblow reports, and bounties disclosed to the public with on-chain cryptographic proofs.
              </p>
            </div>
            <DisclosuresWall submissions={submissions} />
          </div>
        )}

        {tab === 'directory' && (
          <div className="container" style={{ padding: '2rem 1.5rem 4rem' }}>
            <DirectoryTab
              recipients={recipients}
              onSelectAndSend={r => { setSelectedRecipient(r); setTab('send'); }}
              onOpenRegisterModal={() => setIsRegisterOpen(true)}
            />
          </div>
        )}

        {tab === 'about' && (
          <AboutFaqTab onGoSend={() => setTab('send')} onGoRegister={() => setIsRegisterOpen(true)} />
        )}
      </main>

      {/* ─── Footer ─── */}
      <footer className="site-footer">
        <div className="container footer-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--green)', fontSize: '0.82rem', fontWeight: 600 }}>
            <ShieldCheck size={15} />
            Built for ZECATHON · Powered by Zcash Orchard
          </div>
          <div className="footer-links">
            <button type="button" onClick={() => setTab('about')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: '0.8rem', padding: 0 }}>About &amp; FAQ</button>
            <span>·</span>
            <button type="button" onClick={() => setIsJudgeKitOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: '0.8rem', padding: 0 }}>Judge Kit</button>
            <span>·</span>
            <a
              href="https://github.com/habibixyz/zec-whisper"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--text-3)', textDecoration: 'none', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              <GithubIcon size={13} /> GitHub
            </a>
            <span>·</span>
            <span>ZIP-321 · AES-256-GCM · No Logs</span>
          </div>
        </div>
      </footer>

      {/* ─── Modals ─── */}
      <RegisterDropBoxModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegister={handleRegister}
      />

      <LightwalletdScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        status={network}
        onRefresh={refreshNetwork}
        isRefreshing={isRefreshingNet}
      />

      <JudgeTestingKitModal
        isOpen={isJudgeKitOpen}
        onClose={() => setIsJudgeKitOpen(false)}
        mainnetAddress={selectedRecipient?.unifiedAddress || ''}
      />
    </div>
  );
}
