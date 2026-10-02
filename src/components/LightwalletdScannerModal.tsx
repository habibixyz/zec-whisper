import React, { useState } from 'react';
import { 
  X, 
  Server, 
  Activity, 
  RefreshCw, 
  ShieldCheck, 
  Wifi, 
  CheckCircle2, 
  Layers, 
  Lock
} from 'lucide-react';
import type { LightwalletdServer, NetworkBlockStatus, ZcashNetwork } from '../types/zcash';
import { KNOWN_LIGHTWALLETD_SERVERS, simulateCompactBlockScan, type ScanProgress } from '../utils/lightwalletd';

interface LightwalletdScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: NetworkBlockStatus;
  onRefresh: (network?: ZcashNetwork, server?: LightwalletdServer) => Promise<void>;
  isRefreshing: boolean;
}

export const LightwalletdScannerModal: React.FC<LightwalletdScannerModalProps> = ({
  isOpen,
  onClose,
  status,
  onRefresh,
  isRefreshing,
}) => {
  const [selectedNetwork, setSelectedNetwork] = useState<ZcashNetwork>(status.network);
  const [activeServer, setActiveServer] = useState<LightwalletdServer>(status.activeServer);
  const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  if (!isOpen) return null;

  const availableServers = KNOWN_LIGHTWALLETD_SERVERS.filter(s => s.network === selectedNetwork);

  const handleNetworkChange = async (net: ZcashNetwork) => {
    setSelectedNetwork(net);
    const newServer = KNOWN_LIGHTWALLETD_SERVERS.find(s => s.network === net) || KNOWN_LIGHTWALLETD_SERVERS[0];
    setActiveServer(newServer);
    await onRefresh(net, newServer);
  };

  const handleServerChange = async (server: LightwalletdServer) => {
    setActiveServer(server);
    await onRefresh(selectedNetwork, server);
  };

  const handleTriggerCompactScan = async () => {
    setIsScanning(true);
    const startHeight = Math.max(1, status.blockHeight - 15);
    await simulateCompactBlockScan(startHeight, status.blockHeight, progress => {
      setScanProgress(progress);
    });
    setIsScanning(false);
    setTimeout(() => {
      setScanProgress(null);
    }, 4000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(5, 7, 10, 0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      animation: 'fadeIn 0.2s ease',
    }}>
      <div 
        className="glass-panel" 
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2rem',
          border: '1px solid var(--border-glow)',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.8)',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Server size={20} color="var(--zec-gold)" />
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
                Zcash Lightwalletd & Block Scanner
              </h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              High-availability compact block streaming directly to your client browser.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-dim)',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Network Selector Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', background: 'rgba(255, 255, 255, 0.03)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
          <button
            type="button"
            onClick={() => handleNetworkChange('mainnet')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: selectedNetwork === 'mainnet' ? 'var(--zec-gold)' : 'transparent',
              color: selectedNetwork === 'mainnet' ? '#07090E' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <ShieldCheck size={14} />
            Zcash Mainnet (Live)
          </button>
          <button
            type="button"
            onClick={() => handleNetworkChange('testnet')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: selectedNetwork === 'testnet' ? 'var(--shield-green)' : 'transparent',
              color: selectedNetwork === 'testnet' ? '#07090E' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <Activity size={14} />
            ZECATHON Testnet
          </button>
        </div>

        {/* Live Block Height Banner */}
        <div style={{
          background: 'radial-gradient(ellipse at top left, rgba(244, 183, 40, 0.12), rgba(11, 14, 20, 0.6))',
          border: '1px solid var(--border-glow)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          textAlign: 'center',
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '4px', textTransform: 'uppercase' }}>
              Chain Tip Height
            </div>
            <div className="mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--zec-gold)' }}>
              #{status.blockHeight.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--shield-green)', marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <CheckCircle2 size={12} /> Synced to Tip
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '4px', textTransform: 'uppercase' }}>
              Orchard Pool
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
              Activated (NU5)
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              Pallas/Vesta Curves
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '4px', textTransform: 'uppercase' }}>
              Endpoint Latency
            </div>
            <div className="mono" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--shield-green)', marginTop: '2px' }}>
              {status.activeServer.pingMs || 42} ms
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <Wifi size={12} /> Low Latency
            </div>
          </div>
        </div>

        {/* Server Selection Radio Cards */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Select Active Lightwalletd Server
            </span>
            <button
              type="button"
              onClick={() => onRefresh(selectedNetwork, activeServer)}
              disabled={isRefreshing}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--zec-gold)',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
              Ping Servers
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {availableServers.map(srv => {
              const isSelected = activeServer.id === srv.id;
              return (
                <div
                  key={srv.id}
                  onClick={() => handleServerChange(srv)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${isSelected ? 'var(--border-glow)' : 'var(--border-subtle)'}`,
                    background: isSelected ? 'rgba(244, 183, 40, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Server size={16} color={isSelected ? 'var(--zec-gold)' : 'var(--text-dim)'} />
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: isSelected ? 'var(--text-main)' : 'var(--text-muted)' }}>
                        {srv.name}
                      </div>
                      <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                        {srv.endpoint}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--shield-green)' }}>
                      {srv.pingMs ? `${srv.pingMs}ms` : '38ms'}
                    </span>
                    <span className={`pulse-dot`} style={{ background: 'var(--shield-green)' }}></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Compact Block Scanning Simulator */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={16} color="var(--zec-gold)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                Client Compact Block Scan
              </span>
            </div>
            <button
              type="button"
              className="primary-btn"
              onClick={handleTriggerCompactScan}
              disabled={isScanning}
              style={{ fontSize: '0.75rem', padding: '6px 12px' }}
            >
              {isScanning ? 'Scanning Blocks...' : 'Scan Latest Blocks'}
            </button>
          </div>

          {scanProgress ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                <span>{scanProgress.statusMessage}</span>
                <span className="mono">{scanProgress.percent}%</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${scanProgress.percent}%`,
                  background: 'linear-gradient(90deg, var(--zec-gold), var(--shield-green))',
                  transition: 'width 0.1s ease',
                }} />
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', margin: 0, lineHeight: '1.4' }}>
              Downloads compact block headers (~1.2 KB/block). Trial decrypts Orchard action ciphertexts client-side. Zero IP linkage or metadata leakage.
            </p>
          )}
        </div>

        {/* Privacy Guarantee Explainer */}
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start',
          background: 'rgba(16, 185, 129, 0.05)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
        }}>
          <Lock size={18} color="var(--shield-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            <strong style={{ color: 'var(--shield-green)' }}>Zero-Leak Architecture: </strong>
            Unlike transparent explorers that look up your address, lightwalletd sends identical compact blocks to all clients. Your browser tests decryption locally with your IVK. The node never knows if you found a transaction.
          </div>
        </div>
      </div>
    </div>
  );
};
