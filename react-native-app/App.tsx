import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  Dimensions,
  Vibration,
  TextInput,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

type AppView = 'accounts' | 'dashboard' | 'tracker' | 'history' | 'settings';

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('accounts');
  const [activeAccountIdx, setActiveAccountIdx] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isPayPalEscrowOpen, setIsPayPalEscrowOpen] = useState(false);
  const [activeCaseTab, setActiveCaseTab] = useState<'merchant' | 'user' | 'driver'>('merchant');

  // Merchant state
  const [cokeStock, setCokeStock] = useState(42);
  const [feedback, setFeedback] = useState<string | null>(null);

  // User budget state
  const [foodSpent, setFoodSpent] = useState(24000);

  // Driver bus state
  const [koropePaid, setKoropePaid] = useState(5);

  const accounts = [
    {
      id: 'checking',
      name: 'T-Pay Checking',
      num: '2084739102',
      balance: '₦84,500.00',
      badge: 'Primary Current',
    },
    {
      id: 'savings',
      name: 'T-Pay Savings',
      num: '0039481920',
      balance: '₦420,000.00',
      badge: '+6.8% High Yield APY',
    },
    {
      id: 'offline',
      name: 'T-Pay Offline Checking',
      num: '9102837461',
      balance: '₦25,000.00',
      badge: 'BLE / Wi-Fi Sync Ready',
    },
  ];

  const showToast = (msg: string) => {
    setFeedback(msg);
    Vibration.vibrate(40);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleCoke1k = () => {
    if (cokeStock >= 2) {
      setCokeStock((prev) => prev - 2);
      showToast('Sold 2 bottles of Coke for ₦1,000. Stock updated.');
    }
  };

  const handleSpag2k = () => {
    setFoodSpent((prev) => prev + 2000);
    showToast('Deducted ₦2,000 from Food budget (tagged "for spag").');
  };

  const handleBusCollect = () => {
    setKoropePaid(7);
    showToast('All 7 seats collected via Bluetooth! Full manifest synced.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />

      {/* TOP HEADER */}
      <View style={styles.header}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>MO</Text>
          </View>
          <View>
            <Text style={styles.greetingText}>Good day,</Text>
            <Text style={styles.profileName}>Malik Olajuwon</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.paypalPill}
            onPress={() => setIsPayPalEscrowOpen(true)}
          >
            <Text style={styles.paypalPillText}>PayPal</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setIsVoiceModalOpen(true)}
          >
            <Text style={styles.zapIcon}>⚡</Text>
          </TouchableOpacity>

          {/* HAMBURGER MENU BUTTON */}
          <TouchableOpacity
            style={styles.hamburgerBtn}
            onPress={() => setIsDrawerOpen(true)}
          >
            <Text style={styles.hamburgerIcon}>☰</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* TOAST FEEDBACK */}
      {feedback && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>✓ {feedback}</Text>
        </View>
      )}

      {/* VIEW SWITCHING */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeView === 'accounts' && (
          <View>
            {/* 1. THREE SWIPABLE T-PAY ACCOUNTS */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>T-PAY ACCOUNTS</Text>
              <Text style={styles.badgeIndicator}>
                {activeAccountIdx + 1} of {accounts.length}
              </Text>
            </View>

            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / (width - 32));
                setActiveAccountIdx(idx);
              }}
              style={styles.carouselContainer}
            >
              {accounts.map((acct, i) => (
                <View key={acct.id} style={[styles.card, { width: width - 32 }]}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardBrand}>
                      <View style={styles.tLogo}>
                        <Text style={styles.tLogoText}>T</Text>
                      </View>
                      <View>
                        <Text style={styles.brandTitle}>T-PAY</Text>
                        <Text style={styles.cardSubname}>{acct.name}</Text>
                      </View>
                    </View>
                    <Text style={styles.cardBadge}>{acct.badge}</Text>
                  </View>

                  <Text style={styles.cardBalanceLabel}>AVAILABLE BALANCE</Text>
                  <Text style={styles.cardBalance}>{acct.balance}</Text>

                  <View style={styles.cardFooter}>
                    <Text style={styles.cardAcctNum}>•••• {acct.num.slice(-4)}</Text>
                    <Text style={styles.cardStatus}>Active · T-Pay Mesh</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* 2. CENTER ACTION CIRCLE WITH OPPOSING HALF-BARB ARROWS & "hold to speak" */}
            <View style={styles.centerActionWrap}>
              <TouchableOpacity
                style={styles.circleButton}
                onPress={() => setIsVoiceModalOpen(true)}
                onLongPress={() => {
                  Vibration.vibrate(60);
                  setIsVoiceModalOpen(true);
                }}
                activeOpacity={0.85}
              >
                {/* Two Half-Barb Opposing Arrows SVG */}
                <Svg width={30} height={30} viewBox="0 0 24 24" fill="none">
                  {/* Upward arrow with half-barb */}
                  <Path
                    d="M7 17.5V6.5M7 6.5L3.5 10"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Downward arrow with half-barb */}
                  <Path
                    d="M17 6.5V17.5M17 17.5L20.5 14"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>
              <Text style={styles.holdToSpeakText}>hold to speak</Text>
              <Text style={styles.tapSubText}>or tap to send & receive</Text>
            </View>

            {/* Quick Actions Grid */}
            <View style={styles.quickGrid}>
              <TouchableOpacity
                style={styles.gridBtn}
                onPress={() => setActiveView('tracker')}
              >
                <Text style={styles.gridBtnIcon}>📊</Text>
                <Text style={styles.gridBtnText}>Tracker</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.gridBtn}
                onPress={() => setIsPayPalEscrowOpen(true)}
              >
                <Text style={styles.gridBtnIcon}>🛡️</Text>
                <Text style={styles.gridBtnText}>Escrow</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.gridBtn}
                onPress={() => setActiveView('history')}
              >
                <Text style={styles.gridBtnIcon}>📜</Text>
                <Text style={styles.gridBtnText}>History</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.gridBtn}
                onPress={() => setActiveView('settings')}
              >
                <Text style={styles.gridBtnIcon}>⚙️</Text>
                <Text style={styles.gridBtnText}>Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* TRACKER VIEW */}
        {activeView === 'tracker' && (
          <View style={styles.innerView}>
            <View style={styles.viewTopBar}>
              <TouchableOpacity onPress={() => setActiveView('accounts')}>
                <Text style={styles.backBtnText}>← Accounts</Text>
              </TouchableOpacity>
              <Text style={styles.viewTitle}>SMART RESOURCE TRACKER</Text>
            </View>

            <View style={styles.tabRow}>
              <TouchableOpacity
                style={[styles.tabItem, activeCaseTab === 'merchant' && styles.tabActive]}
                onPress={() => setActiveCaseTab('merchant')}
              >
                <Text style={[styles.tabText, activeCaseTab === 'merchant' && styles.tabTextActive]}>
                  Merchant
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabItem, activeCaseTab === 'user' && styles.tabActive]}
                onPress={() => setActiveCaseTab('user')}
              >
                <Text style={[styles.tabText, activeCaseTab === 'user' && styles.tabTextActive]}>
                  Budget
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabItem, activeCaseTab === 'driver' && styles.tabActive]}
                onPress={() => setActiveCaseTab('driver')}
              >
                <Text style={[styles.tabText, activeCaseTab === 'driver' && styles.tabTextActive]}>
                  Korope (7)
                </Text>
              </TouchableOpacity>
            </View>

            {activeCaseTab === 'merchant' && (
              <View style={styles.caseCard}>
                <Text style={styles.caseHeading}>Mama Nkechi Provisions</Text>
                <Text style={styles.caseSub}>Coke (50cl Pet) Stock: {cokeStock} bottles (@ ₦500)</Text>
                <TouchableOpacity style={styles.actionBtn} onPress={handleCoke1k}>
                  <Text style={styles.actionBtnText}>"Collect 1k for coke" (Deducts 2)</Text>
                </TouchableOpacity>
              </View>
            )}

            {activeCaseTab === 'user' && (
              <View style={styles.caseCard}>
                <Text style={styles.caseHeading}>Monthly Expense Budget</Text>
                <Text style={styles.caseSub}>Food Spent: ₦{foodSpent.toLocaleString()} / ₦60,000</Text>
                <TouchableOpacity style={styles.actionBtn} onPress={handleSpag2k}>
                  <Text style={styles.actionBtnText}>"Send 2k for spag" (Food Budget)</Text>
                </TouchableOpacity>
              </View>
            )}

            {activeCaseTab === 'driver' && (
              <View style={styles.caseCard}>
                <Text style={styles.caseHeading}>Morufu Transport (7-Seater)</Text>
                <Text style={styles.caseSub}>
                  Manifest: {koropePaid} of 7 seats paid ({7 - koropePaid} left)
                </Text>
                <TouchableOpacity style={styles.actionBtn} onPress={handleBusCollect}>
                  <Text style={styles.actionBtnText}>"Collect from everybody" (BLE)</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* DASHBOARD VIEW */}
        {activeView === 'dashboard' && (
          <View style={styles.innerView}>
            <View style={styles.viewTopBar}>
              <TouchableOpacity onPress={() => setActiveView('accounts')}>
                <Text style={styles.backBtnText}>← Accounts</Text>
              </TouchableOpacity>
              <Text style={styles.viewTitle}>EXECUTIVE DASHBOARD</Text>
            </View>

            <View style={styles.dashCard}>
              <Text style={styles.dashLabel}>TOTAL LIQUID NET WORTH</Text>
              <Text style={styles.dashAmount}>₦529,500.00</Text>
              <Text style={styles.dashGrowth}>+₦36,380.00 (+7.4%) this month</Text>
            </View>
          </View>
        )}

        {/* HISTORY VIEW */}
        {activeView === 'history' && (
          <View style={styles.innerView}>
            <View style={styles.viewTopBar}>
              <TouchableOpacity onPress={() => setActiveView('accounts')}>
                <Text style={styles.backBtnText}>← Accounts</Text>
              </TouchableOpacity>
              <Text style={styles.viewTitle}>TRANSACTION HISTORY</Text>
            </View>
            <View style={styles.historyItem}>
              <Text style={styles.historyTitle}>Offline BLE Transfer to Bus #04</Text>
              <Text style={styles.historyAmt}>-₦500.00</Text>
            </View>
            <View style={styles.historyItem}>
              <Text style={styles.historyTitle}>Transfer to Babatunde Raji</Text>
              <Text style={styles.historyAmt}>-₦12,500.00</Text>
            </View>
          </View>
        )}

        {/* SETTINGS VIEW */}
        {activeView === 'settings' && (
          <View style={styles.innerView}>
            <View style={styles.viewTopBar}>
              <TouchableOpacity onPress={() => setActiveView('accounts')}>
                <Text style={styles.backBtnText}>← Accounts</Text>
              </TouchableOpacity>
              <Text style={styles.viewTitle}>SETTINGS & SECURITY</Text>
            </View>
            <View style={styles.caseCard}>
              <Text style={styles.caseHeading}>Bluetooth Mesh Discovery: ON</Text>
              <Text style={styles.caseSub}>Biometric Lock: ENABLED</Text>
              <Text style={styles.caseSub}>PayPal Gateway Bridge: CONNECTED</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* SLIDE-IN HAMBURGER MENU DRAWER */}
      <Modal visible={isDrawerOpen} transparent animationType="slide">
        <View style={styles.drawerOverlay}>
          <View style={styles.drawerContent}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>T-PAY MENU</Text>
              <TouchableOpacity onPress={() => setIsDrawerOpen(false)}>
                <Text style={styles.drawerClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.menuItem, activeView === 'accounts' && styles.menuItemActive]}
              onPress={() => {
                setActiveView('accounts');
                setIsDrawerOpen(false);
              }}
            >
              <Text style={styles.menuItemText}>💳 Accounts (3 Swipable Cards)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, activeView === 'dashboard' && styles.menuItemActive]}
              onPress={() => {
                setActiveView('dashboard');
                setIsDrawerOpen(false);
              }}
            >
              <Text style={styles.menuItemText}>📊 Dashboard (Portfolio Stats)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, activeView === 'tracker' && styles.menuItemActive]}
              onPress={() => {
                setActiveView('tracker');
                setIsDrawerOpen(false);
              }}
            >
              <Text style={styles.menuItemText}>🛍️ Tracker (Merchant/User/Bus)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, activeView === 'history' && styles.menuItemActive]}
              onPress={() => {
                setActiveView('history');
                setIsDrawerOpen(false);
              }}
            >
              <Text style={styles.menuItemText}>📜 History (Ledger)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, activeView === 'settings' && styles.menuItemActive]}
              onPress={() => {
                setActiveView('settings');
                setIsDrawerOpen(false);
              }}
            >
              <Text style={styles.menuItemText}>⚙️ Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.paypalDrawerBtn}
              onPress={() => {
                setIsDrawerOpen(false);
                setIsPayPalEscrowOpen(true);
              }}
            >
              <Text style={styles.paypalDrawerText}>🛡️ PayPal Offline Escrow Vault</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* VOICE ASSISTANT MODAL */}
      <Modal visible={isVoiceModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.voiceCard}>
            <Text style={styles.voiceTitle}>T-Pay Hybrid Voice AI</Text>
            <Text style={styles.voiceSub}>Works Offline via SLM & Online via Gemini</Text>
            <TouchableOpacity
              style={styles.sampleVoiceBtn}
              onPress={() => {
                handleCoke1k();
                setIsVoiceModalOpen(false);
              }}
            >
              <Text style={styles.sampleVoiceText}>"Collect one thousand for coke"</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sampleVoiceBtn}
              onPress={() => {
                handleSpag2k();
                setIsVoiceModalOpen(false);
              }}
            >
              <Text style={styles.sampleVoiceText}>"Send 2k for spag"</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sampleVoiceBtn}
              onPress={() => {
                handleBusCollect();
                setIsVoiceModalOpen(false);
              }}
            >
              <Text style={styles.sampleVoiceText}>"Collect money from everybody"</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setIsVoiceModalOpen(false)}
            >
              <Text style={styles.closeBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* PAYPAL ESCROW MODAL */}
      <Modal visible={isPayPalEscrowOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.paypalCard}>
            <Text style={styles.paypalTitle}>PayPal Offline Escrow</Text>
            <Text style={styles.paypalSub}>
              Zero-data BLE cryptogram between Device A & B. As soon as connection restores,
              PayPal API clears the transaction.
            </Text>
            <TouchableOpacity
              style={styles.paypalActionBtn}
              onPress={() => {
                showToast('PayPal API captured escrow token #8491. Funds settled.');
                setIsPayPalEscrowOpen(false);
              }}
            >
              <Text style={styles.paypalActionText}>Sync Offline Tokens to PayPal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setIsPayPalEscrowOpen(false)}
            >
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  greetingText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  profileName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paypalPill: {
    backgroundColor: '#0c4a6e',
    borderColor: '#0284c7',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  paypalPillText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  iconBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
  },
  zapIcon: {
    color: '#ef4444',
    fontSize: 14,
  },
  hamburgerBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#450a0a',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  hamburgerIcon: {
    color: '#f87171',
    fontSize: 15,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  badgeIndicator: {
    color: '#ef4444',
    fontSize: 11,
    fontWeight: 'bold',
  },
  carouselContainer: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    marginRight: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tLogo: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tLogoText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  brandTitle: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 13,
  },
  cardSubname: {
    color: '#94a3b8',
    fontSize: 10,
  },
  cardBadge: {
    color: '#ef4444',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardBalanceLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '600',
  },
  cardBalance: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  cardAcctNum: {
    color: '#cbd5e1',
    fontFamily: 'monospace',
    fontSize: 11,
  },
  cardStatus: {
    color: '#34d399',
    fontSize: 10,
  },
  centerActionWrap: {
    alignItems: 'center',
    marginVertical: 14,
  },
  circleButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#f87171',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  holdToSpeakText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  tapSubText: {
    color: '#475569',
    fontSize: 10,
  },
  quickGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  gridBtn: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  gridBtnIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  gridBtnText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '600',
  },
  innerView: {
    paddingVertical: 10,
  },
  viewTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingBottom: 8,
  },
  backBtnText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: 'bold',
  },
  viewTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 14,
    padding: 4,
    marginBottom: 14,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#dc2626',
  },
  tabText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  caseCard: {
    backgroundColor: '#0f172a',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 12,
  },
  caseHeading: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  caseSub: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 12,
  },
  actionBtn: {
    backgroundColor: '#dc2626',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  dashCard: {
    backgroundColor: '#0f172a',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  dashLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  dashAmount: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  dashGrowth: {
    color: '#34d399',
    fontSize: 12,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#0f172a',
    borderRadius: 14,
    marginBottom: 8,
  },
  historyTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  historyAmt: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: 'bold',
  },
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  drawerContent: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  drawerTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  drawerClose: {
    color: '#94a3b8',
    fontSize: 18,
    fontWeight: 'bold',
  },
  menuItem: {
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  menuItemActive: {
    backgroundColor: '#450a0a',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  menuItemText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  paypalDrawerBtn: {
    backgroundColor: '#0369a1',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  paypalDrawerText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  voiceCard: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  voiceTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  voiceSub: {
    color: '#94a3b8',
    fontSize: 11,
    marginBottom: 16,
  },
  sampleVoiceBtn: {
    backgroundColor: '#1e293b',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  sampleVoiceText: {
    color: '#f87171',
    fontSize: 12,
    fontWeight: 'bold',
  },
  closeBtn: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#334155',
    borderRadius: 12,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  paypalCard: {
    backgroundColor: '#082f49',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#0284c7',
  },
  paypalTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  paypalSub: {
    color: '#bae6fd',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 16,
  },
  paypalActionBtn: {
    backgroundColor: '#0284c7',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  paypalActionText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  toast: {
    backgroundColor: '#064e3b',
    padding: 10,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#059669',
  },
  toastText: {
    color: '#6ee7b7',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
