import React, { useState, useEffect } from 'react';
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
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

type AppView = 'accounts' | 'dashboard' | 'tracker' | 'history' | 'settings' | 'pitch';
type SupportedDialect = 'pidgin' | 'en' | 'yoruba' | 'igbo' | 'hausa';

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('accounts');
  const [activeAccountIdx, setActiveAccountIdx] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isPayPalEscrowOpen, setIsPayPalEscrowOpen] = useState(false);
  const [activeEscrowTab, setActiveEscrowTab] = useState<'vault' | 'tokens' | 'direct'>('vault');
  const [activeCaseTab, setActiveCaseTab] = useState<'merchant' | 'user' | 'driver'>('merchant');
  const [activePitchTab, setActivePitchTab] = useState<'deck' | 'cases' | 'architecture' | 'strategy'>('deck');

  // Feedback toast
  const [feedback, setFeedback] = useState<string | null>(null);

  // Merchant state (Mama Nkechi)
  const [cokeStock, setCokeStock] = useState(42);
  const [maltinaStock, setMaltinaStock] = useState(56);
  const [cashSales, setCashSales] = useState(0);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // User budget state (Salary Earner)
  const [foodSpent, setFoodSpent] = useState(24000);
  const [transportSpent, setTransportSpent] = useState(12000);
  const [upkeepSpent, setUpkeepSpent] = useState(18000);
  const [isAmbiguityModalOpen, setIsAmbiguityModalOpen] = useState(false);
  const [ambiguousAmount, setAmbiguousAmount] = useState(5000);

  // Driver bus state (Morufu Transport Korope)
  const [koropeSeats, setKoropeSeats] = useState<boolean[]>([true, true, true, true, true, false, false]);

  // Market Vault State ("The Budget-Locked Vault")
  const [isVaultLocked, setIsVaultLocked] = useState(false);
  const [vaultAllocated, setVaultAllocated] = useState(10000);
  const [vaultRemaining, setVaultRemaining] = useState(10000);
  const [vaultDurationHours, setVaultDurationHours] = useState(5);
  const [vaultPreAuthId, setVaultPreAuthId] = useState('PAYPAL-AUTH-9284-HMAC');
  const [vaultCountdown, setVaultCountdown] = useState('04:59:45');

  // Voice AI State
  const [voiceDialect, setVoiceDialect] = useState<SupportedDialect>('pidgin');
  const [isLocalSLM, setIsLocalSLM] = useState(true);
  const [lastAiResponse, setLastAiResponse] = useState<string | null>(null);

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

  // Case 1: Merchant Actions
  const handleCoke1k = () => {
    if (cokeStock >= 2) {
      setCokeStock((prev) => prev - 2);
      setCashSales((prev) => prev + 1000);
      showToast('Sold 2 bottles Coke (₦1,000). Stock: ' + (cokeStock - 2) + ', Cash +₦1,000.');
    } else {
      showToast('Insufficient Coke bottles in stock!');
    }
  };

  const handleVoiceInventorySetup = () => {
    setCokeStock(42);
    setMaltinaStock(56);
    showToast('Spoken inventory recorded: 42 packs Coke, 56 packs Maltina.');
  };

  // Case 2: Regular User Actions
  const handleSpag2k = () => {
    setFoodSpent((prev) => prev + 2000);
    showToast('Deducted ₦2,000 from Food Budget (tagged "for spag").');
  };

  const handleResolveAmbiguity = (category: 'food' | 'transport' | 'upkeep') => {
    if (category === 'food') setFoodSpent((p) => p + ambiguousAmount);
    if (category === 'transport') setTransportSpent((p) => p + ambiguousAmount);
    if (category === 'upkeep') setUpkeepSpent((p) => p + ambiguousAmount);
    setIsAmbiguityModalOpen(false);
    showToast(`Classified ₦${ambiguousAmount.toLocaleString()} under ${category.toUpperCase()} budget.`);
  };

  // Case 3: Bus Driver Actions
  const handleSweepKorope = () => {
    setKoropeSeats([true, true, true, true, true, true, true]);
    showToast('Morufu Transport: BLE proximity sweep collected all 7 seats! Manifest complete.');
  };

  // Market Vault Actions
  const handleLockVault = (amount: number, hours: number) => {
    setIsVaultLocked(true);
    setVaultAllocated(amount);
    setVaultRemaining(amount);
    setVaultDurationHours(hours);
    const newAuthId = 'PAYPAL-AUTH-' + Math.floor(1000 + Math.random() * 9000) + '-HMAC';
    setVaultPreAuthId(newAuthId);
    showToast(`Time-Locked Market Vault active! ₦${amount.toLocaleString()} pre-auth locked on PayPal.`);
  };

  const handleSimulateVaultSpend = () => {
    if (!isVaultLocked) {
      showToast('Please lock your Market Vault first!');
      return;
    }
    if (vaultRemaining < 2000) {
      showToast('Insufficient vault balance!');
      return;
    }
    setVaultRemaining((prev) => prev - 2000);
    showToast('Offline voucher issued: -₦2,000 at Mama Nkechi Provisions (HMAC signed).');
  };

  const handleAutoMelt = () => {
    const unspent = vaultRemaining;
    setIsVaultLocked(false);
    setVaultRemaining(0);
    showToast(`Auto-Melt Guarantee executed! ₦${unspent.toLocaleString()} melted back into PayPal checking.`);
  };

  // Voice AI Execution
  const handleVoiceCommand = (cmd: string) => {
    const lower = cmd.toLowerCase();
    if (lower.includes('coke')) {
      handleCoke1k();
      setLastAiResponse('₦1,000 for Coke confirmed! At ₦500/bottle, that is 2 bottles. Stock minus 2.');
    } else if (lower.includes('spag')) {
      handleSpag2k();
      setLastAiResponse('Deducted ₦2,000 from Food budget with note "for spag". Remaining: ₦34,000.');
    } else if (lower.includes('everybody') || lower.includes('bus')) {
      handleSweepKorope();
      setLastAiResponse('Swept 7-seater Korope via Bluetooth BLE. All 7 passengers paid!');
    } else if (lower.includes('lock') || lower.includes('market')) {
      handleLockVault(10000, 5);
      setLastAiResponse('Pre-authorized ₦10,000 on PayPal for 5-hour Market Vault.');
    } else if (lower.includes('audit')) {
      setIsAuditModalOpen(true);
      setLastAiResponse('End-of-day reconciliation opened for Mama Nkechi Provisions.');
    } else if (lower.includes('sneaker')) {
      setIsAmbiguityModalOpen(true);
      setLastAiResponse('Clarification: Does ₦5,000 for sneakers fall under Food, Transport, or Upkeep?');
    } else {
      setLastAiResponse(`Understood "${cmd}". Logged by ${isLocalSLM ? 'Mobile SLM' : 'Gemini Cloud'}.`);
    }
  };

  const paidSeatsCount = koropeSeats.filter(Boolean).length;

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
            style={styles.pitchPill}
            onPress={() => setActiveView('pitch')}
          >
            <Text style={styles.pitchPillText}>🏆 Pitch Hub</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.paypalPill}
            onPress={() => setIsPayPalEscrowOpen(true)}
          >
            <Text style={styles.paypalPillText}>🛡️ Vault</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setIsVoiceModalOpen(true)}
          >
            <Text style={styles.zapIcon}>⚡</Text>
          </TouchableOpacity>

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
        {/* VIEW 1: ACCOUNTS */}
        {activeView === 'accounts' && (
          <View>
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
              {accounts.map((acct) => (
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

            {/* CENTER ACTION CIRCLE WITH OPPOSING HALF-BARB ARROWS */}
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
                <Svg width={30} height={30} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M7 17.5V6.5M7 6.5L3.5 10"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
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
              <Text style={styles.tapSubText}>hybrid offline voice AI</Text>
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
                <Text style={styles.gridBtnText}>Vault</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.gridBtn}
                onPress={() => setActiveView('pitch')}
              >
                <Text style={styles.gridBtnIcon}>🏆</Text>
                <Text style={styles.gridBtnText}>Pitch</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.gridBtn}
                onPress={() => setActiveView('history')}
              >
                <Text style={styles.gridBtnIcon}>📜</Text>
                <Text style={styles.gridBtnText}>History</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* VIEW 2: SMART RESOURCE TRACKER (THE 3 SPEC CASES) */}
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
                  Mama Nkechi
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabItem, activeCaseTab === 'user' && styles.tabActive]}
                onPress={() => setActiveCaseTab('user')}
              >
                <Text style={[styles.tabText, activeCaseTab === 'user' && styles.tabTextActive]}>
                  Salary Budget
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

            {/* Case 1: Mama Nkechi Provisions */}
            {activeCaseTab === 'merchant' && (
              <View style={styles.caseCard}>
                <View style={styles.caseBadgeRow}>
                  <Text style={styles.caseHeading}>Mama Nkechi Provisions</Text>
                  <Text style={styles.liveBadge}>LIVE SPREADSHEET</Text>
                </View>
                <Text style={styles.caseSub}>
                  Voice-driven inventory tracking & natural price-to-quantity derivation for non-literate merchants.
                </Text>

                <View style={styles.stockGrid}>
                  <View style={styles.stockItem}>
                    <Text style={styles.stockLabel}>Coke 50cl Pet</Text>
                    <Text style={styles.stockValue}>{cokeStock} bottles</Text>
                    <Text style={styles.stockPrice}>₦500 / bottle</Text>
                  </View>
                  <View style={styles.stockItem}>
                    <Text style={styles.stockLabel}>Maltina 33cl Can</Text>
                    <Text style={styles.stockValue}>{maltinaStock} cans</Text>
                    <Text style={styles.stockPrice}>₦600 / can</Text>
                  </View>
                  <View style={styles.stockItem}>
                    <Text style={styles.stockLabel}>Cash Sales Tally</Text>
                    <Text style={[styles.stockValue, { color: '#34d399' }]}>
                      ₦{cashSales.toLocaleString()}
                    </Text>
                    <Text style={styles.stockPrice}>Physical Cash</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.actionBtn} onPress={handleCoke1k}>
                  <Text style={styles.actionBtnText}>
                    "Collect 1k for coke" (₦1,000 / ₦500 = -2 Bottles)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#1e293b', marginTop: 8 }]}
                  onPress={handleVoiceInventorySetup}
                >
                  <Text style={[styles.actionBtnText, { color: '#f87171' }]}>
                    "Spoken Inventory Setup" (42 Coke, 56 Maltina)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#065f46', marginTop: 8 }]}
                  onPress={() => setIsAuditModalOpen(true)}
                >
                  <Text style={styles.actionBtnText}>
                    📋 Daily Stock Review & Reconciliation Audit
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Case 2: Salary Earner Monthly Budget */}
            {activeCaseTab === 'user' && (
              <View style={styles.caseCard}>
                <View style={styles.caseBadgeRow}>
                  <Text style={styles.caseHeading}>Monthly Expense Budget</Text>
                  <Text style={styles.liveBadge}>SMART AI CATEGORIZER</Text>
                </View>
                <Text style={styles.caseSub}>
                  Salary earner budget with conversational ambiguity clarification.
                </Text>

                <View style={styles.budgetRow}>
                  <Text style={styles.budgetLabel}>Food Budget:</Text>
                  <Text style={styles.budgetValue}>
                    ₦{foodSpent.toLocaleString()} / ₦60,000
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.min(100, (foodSpent / 60000) * 100)}%` },
                    ]}
                  />
                </View>

                <View style={styles.budgetRow}>
                  <Text style={styles.budgetLabel}>Transport Budget:</Text>
                  <Text style={styles.budgetValue}>
                    ₦{transportSpent.toLocaleString()} / ₦30,000
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(100, (transportSpent / 30000) * 100)}%`,
                        backgroundColor: '#3b82f6',
                      },
                    ]}
                  />
                </View>

                <View style={styles.budgetRow}>
                  <Text style={styles.budgetLabel}>Upkeep Budget:</Text>
                  <Text style={styles.budgetValue}>
                    ₦{upkeepSpent.toLocaleString()} / ₦40,000
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(100, (upkeepSpent / 40000) * 100)}%`,
                        backgroundColor: '#a855f7',
                      },
                    ]}
                  />
                </View>

                <TouchableOpacity style={styles.actionBtn} onPress={handleSpag2k}>
                  <Text style={styles.actionBtnText}>
                    "Send 2k for spag" (Auto-Tags Food Budget)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#78350f', marginTop: 8 }]}
                  onPress={() => {
                    setAmbiguousAmount(5000);
                    setIsAmbiguityModalOpen(true);
                  }}
                >
                  <Text style={[styles.actionBtnText, { color: '#fbbf24' }]}>
                    "Send 5k for sneakers" (Triggers AI Ambiguity)
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Case 3: Morufu Transport Korope */}
            {activeCaseTab === 'driver' && (
              <View style={styles.caseCard}>
                <View style={styles.caseBadgeRow}>
                  <Text style={styles.caseHeading}>Morufu Transport (7-Seater)</Text>
                  <Text style={styles.liveBadge}>BLE PROXIMITY SWEEP</Text>
                </View>
                <Text style={styles.caseSub}>
                  Korope mini-bus manifest. Driver announces "collect from everybody" and BLE mesh collects fares.
                </Text>

                <View style={styles.seatGrid}>
                  {koropeSeats.map((isPaid, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.seatBadge,
                        isPaid ? styles.seatPaid : styles.seatUnpaid,
                      ]}
                    >
                      <Text style={styles.seatNum}>Seat #{idx + 1}</Text>
                      <Text style={styles.seatStatus}>
                        {isPaid ? 'PAID ₦500' : 'UNPAID'}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.manifestSummary}>
                  <Text style={styles.manifestText}>
                    Manifest: {paidSeatsCount} of 7 Seats Paid ({7 - paidSeatsCount} left)
                  </Text>
                </View>

                <TouchableOpacity style={styles.actionBtn} onPress={handleSweepKorope}>
                  <Text style={styles.actionBtnText}>
                    "Collect money from everybody" (Bluetooth BLE Mesh Sweep)
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* VIEW 3: JUDGE PITCH HUB */}
        {activeView === 'pitch' && (
          <View style={styles.innerView}>
            <View style={styles.viewTopBar}>
              <TouchableOpacity onPress={() => setActiveView('accounts')}>
                <Text style={styles.backBtnText}>← Accounts</Text>
              </TouchableOpacity>
              <Text style={styles.viewTitle}>JUDGE PITCH HUB</Text>
            </View>

            <View style={styles.tabRow}>
              <TouchableOpacity
                style={[styles.tabItem, activePitchTab === 'deck' && styles.tabActive]}
                onPress={() => setActivePitchTab('deck')}
              >
                <Text style={[styles.tabText, activePitchTab === 'deck' && styles.tabTextActive]}>
                  Deck
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabItem, activePitchTab === 'cases' && styles.tabActive]}
                onPress={() => setActivePitchTab('cases')}
              >
                <Text style={[styles.tabText, activePitchTab === 'cases' && styles.tabTextActive]}>
                  3 Cases
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabItem, activePitchTab === 'architecture' && styles.tabActive]}
                onPress={() => setActivePitchTab('architecture')}
              >
                <Text style={[styles.tabText, activePitchTab === 'architecture' && styles.tabTextActive]}>
                  Vault
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabItem, activePitchTab === 'strategy' && styles.tabActive]}
                onPress={() => setActivePitchTab('strategy')}
              >
                <Text style={[styles.tabText, activePitchTab === 'strategy' && styles.tabTextActive]}>
                  Protocol
                </Text>
              </TouchableOpacity>
            </View>

            {activePitchTab === 'deck' && (
              <View style={styles.pitchDeckContainer}>
                <View style={styles.deckCard}>
                  <Text style={styles.deckSlideNum}>SLIDE 1 · THE REALITY</Text>
                  <Text style={styles.deckSlideTitle}>The African Blackout Crisis</Text>
                  <Text style={styles.deckSlideBody}>
                    In Nigeria and emerging markets, 40%+ of digital transactions fail during cellular blackouts.
                    Merchants carry 3-5 clunky POS terminals, yet commerce grinds to a halt.
                  </Text>
                </View>

                <View style={styles.deckCard}>
                  <Text style={styles.deckSlideNum}>SLIDE 2 · THE SOLUTION</Text>
                  <Text style={styles.deckSlideTitle}>T-Pay: Hybrid SLM & Offline Escrow</Text>
                  <Text style={styles.deckSlideBody}>
                    On-device voice AI understands Nigerian Pidgin, Yoruba, Igbo, and Hausa.
                    Merchants speak sales, and T-Pay auto-deducts inventory and reconciles physical cash without reading or writing spreadsheets.
                  </Text>
                </View>

                <View style={styles.deckCard}>
                  <Text style={styles.deckSlideNum}>SLIDE 3 · THE BIG GUN</Text>
                  <Text style={styles.deckSlideTitle}>The Time-Locked Market Vault</Text>
                  <Text style={styles.deckSlideBody}>
                    Users pre-lock a budget on PayPal servers before stepping into blackout zones.
                    Guarantees zero double-spend fraud offline. Unspent funds automatically melt back when the timer expires!
                  </Text>
                </View>
              </View>
            )}

            {activePitchTab === 'cases' && (
              <View style={styles.caseCard}>
                <Text style={styles.caseHeading}>Interactive Prototype Verification</Text>
                <Text style={styles.caseSub}>
                  All 3 persona cases from the specification document are fully interactive in the Tracker tab:
                </Text>
                <Text style={styles.bulletItem}>• Case 1: Mama Nkechi Provisions (Price-to-quantity & End-of-Day audit)</Text>
                <Text style={styles.bulletItem}>• Case 2: Salary Earner Budget (Ambiguity clarification dialog)</Text>
                <Text style={styles.bulletItem}>• Case 3: Morufu Transport (7-Seat Korope Bluetooth mesh sweep)</Text>
                <TouchableOpacity
                  style={[styles.actionBtn, { marginTop: 12 }]}
                  onPress={() => {
                    setActiveView('tracker');
                  }}
                >
                  <Text style={styles.actionBtnText}>Launch Live Tracker Demo →</Text>
                </TouchableOpacity>
              </View>
            )}

            {activePitchTab === 'architecture' && (
              <View style={styles.caseCard}>
                <Text style={styles.caseHeading}>Zero Double-Spend Architecture</Text>
                <Text style={styles.caseSub}>
                  Why the "Budget-Locked Vault" won over other escrow models:
                </Text>
                <Text style={styles.bulletItem}>
                  1. Pre-Auth Lock: Funds are pre-locked on PayPal servers while online.
                </Text>
                <Text style={styles.bulletItem}>
                  2. Offline Vouchers: Spend tokens signed with HMAC-SHA256 cannot exceed the locked balance.
                </Text>
                <Text style={styles.bulletItem}>
                  3. Opportunistic Clearing: Whichever device gets online first submits the cryptogram.
                </Text>
                <Text style={styles.bulletItem}>
                  4. Auto-Melt Guarantee: Timer expiry automatically refunds unspent balance to checking.
                </Text>
                <TouchableOpacity
                  style={[styles.actionBtn, { marginTop: 12 }]}
                  onPress={() => setIsPayPalEscrowOpen(true)}
                >
                  <Text style={styles.actionBtnText}>Open Live Market Vault Modal →</Text>
                </TouchableOpacity>
              </View>
            )}

            {activePitchTab === 'strategy' && (
              <View style={styles.caseCard}>
                <Text style={styles.caseHeading}>Commercial Strategy & Protocol Expansion</Text>
                <Text style={styles.caseSub}>
                  Phase 1 (Hackathon): Closed-Loop PayPal ecosystem to drive sticky wallet adoption.
                </Text>
                <Text style={styles.caseSub}>
                  Phase 2 (Africa Scale): Open B2B Protocol API licensed to Tier-1 banks (Moniepoint, OPay, PalmPay) to eliminate hardware POS terminal bloat.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* VIEW 4: DASHBOARD */}
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

            <View style={[styles.caseCard, { marginTop: 16 }]}>
              <Text style={styles.caseHeading}>PayPal Vault Pre-Auth Lock</Text>
              <Text style={styles.caseSub}>
                Status: {isVaultLocked ? 'ACTIVE (' + vaultCountdown + ')' : 'INACTIVE'}
              </Text>
              <Text style={styles.cardAcctNum}>Pre-Auth Key: {vaultPreAuthId}</Text>
            </View>
          </View>
        )}

        {/* VIEW 5: HISTORY */}
        {activeView === 'history' && (
          <View style={styles.innerView}>
            <View style={styles.viewTopBar}>
              <TouchableOpacity onPress={() => setActiveView('accounts')}>
                <Text style={styles.backBtnText}>← Accounts</Text>
              </TouchableOpacity>
              <Text style={styles.viewTitle}>LEDGER & CRYPTOGRAMS</Text>
            </View>
            <View style={styles.historyItem}>
              <View>
                <Text style={styles.historyTitle}>Offline BLE Voucher (Mama Nkechi)</Text>
                <Text style={styles.historySub}>HMAC-SHA256: 0x98f4...2b11</Text>
              </View>
              <Text style={styles.historyAmt}>-₦2,000.00</Text>
            </View>
            <View style={styles.historyItem}>
              <View>
                <Text style={styles.historyTitle}>Korope Fare Seat #04</Text>
                <Text style={styles.historySub}>BLE Proximity Mesh Sweep</Text>
              </View>
              <Text style={styles.historyAmt}>-₦500.00</Text>
            </View>
            <View style={styles.historyItem}>
              <View>
                <Text style={styles.historyTitle}>PayPal Pre-Auth Settlement</Text>
                <Text style={styles.historySub}>API Cleared: Txn #8491</Text>
              </View>
              <Text style={[styles.historyAmt, { color: '#34d399' }]}>+₦10,000.00</Text>
            </View>
          </View>
        )}

        {/* VIEW 6: SETTINGS */}
        {activeView === 'settings' && (
          <View style={styles.innerView}>
            <View style={styles.viewTopBar}>
              <TouchableOpacity onPress={() => setActiveView('accounts')}>
                <Text style={styles.backBtnText}>← Accounts</Text>
              </TouchableOpacity>
              <Text style={styles.viewTitle}>SETTINGS & CONFIG</Text>
            </View>
            <View style={styles.caseCard}>
              <Text style={styles.caseHeading}>Bluetooth Mesh: ACTIVE</Text>
              <Text style={styles.caseSub}>Local SLM Engine: ENABLED</Text>
              <Text style={styles.caseSub}>PayPal Gateway Bridge: CONNECTED</Text>
              <Text style={styles.caseSub}>Voice Dialect: {voiceDialect.toUpperCase()}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* MODAL 1: HAMBURGER DRAWER */}
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
              style={[styles.menuItem, activeView === 'pitch' && styles.menuItemActive]}
              onPress={() => {
                setActiveView('pitch');
                setIsDrawerOpen(false);
              }}
            >
              <Text style={styles.menuItemText}>🏆 Pitch Hub (Deck & Spec Demos)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, activeView === 'tracker' && styles.menuItemActive]}
              onPress={() => {
                setActiveView('tracker');
                setIsDrawerOpen(false);
              }}
            >
              <Text style={styles.menuItemText}>🛍️ Tracker (Mama Nkechi / User / Bus)</Text>
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
              style={[styles.menuItem, activeView === 'history' && styles.menuItemActive]}
              onPress={() => {
                setActiveView('history');
                setIsDrawerOpen(false);
              }}
            >
              <Text style={styles.menuItemText}>📜 Ledger & History</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.paypalDrawerBtn}
              onPress={() => {
                setIsDrawerOpen(false);
                setIsPayPalEscrowOpen(true);
              }}
            >
              <Text style={styles.paypalDrawerText}>🛡️ Time-Locked Market Vault</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: HYBRID VOICE ASSISTANT */}
      <Modal visible={isVoiceModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.voiceCard}>
            <View style={styles.voiceHeader}>
              <Text style={styles.voiceTitle}>T-Pay Hybrid Voice AI</Text>
              <TouchableOpacity onPress={() => setIsVoiceModalOpen(false)}>
                <Text style={styles.drawerClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.voiceSub}>
              Mobile SLM (Offline) & Gemini Cloud · Zero Literacy Barrier
            </Text>

            {/* Dialect Selector */}
            <View style={styles.dialectRow}>
              {(['pidgin', 'en', 'yoruba', 'igbo', 'hausa'] as SupportedDialect[]).map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.dialectPill, voiceDialect === d && styles.dialectPillActive]}
                  onPress={() => setVoiceDialect(d)}
                >
                  <Text
                    style={[
                      styles.dialectText,
                      voiceDialect === d && styles.dialectTextActive,
                    ]}
                  >
                    {d.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* AI Speech Bubble */}
            {lastAiResponse && (
              <View style={styles.aiSpeechBubble}>
                <Text style={styles.aiSpeechLabel}>AI Audio Readout (Spoken Out Loud):</Text>
                <Text style={styles.aiSpeechText}>"{lastAiResponse}"</Text>
              </View>
            )}

            <Text style={styles.sampleHeader}>TEST SPECIFICATION COMMANDS:</Text>

            <TouchableOpacity
              style={styles.sampleVoiceBtn}
              onPress={() => handleVoiceCommand('Collect 1k for coke')}
            >
              <Text style={styles.sampleVoiceText}>"Collect 1k for coke"</Text>
              <Text style={styles.sampleVoiceSub}>Case 1: Auto derives 2 bottles</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sampleVoiceBtn}
              onPress={() => handleVoiceCommand('Lock 10k for market vault')}
            >
              <Text style={styles.sampleVoiceText}>"Lock 10k for market vault"</Text>
              <Text style={styles.sampleVoiceSub}>The Big Gun: Pre-auth lock</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sampleVoiceBtn}
              onPress={() => handleVoiceCommand('Send 2k for spag')}
            >
              <Text style={styles.sampleVoiceText}>"Send 2k for spag"</Text>
              <Text style={styles.sampleVoiceSub}>Case 2: Auto-tags Food budget</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sampleVoiceBtn}
              onPress={() => handleVoiceCommand('Send 5k for sneakers')}
            >
              <Text style={styles.sampleVoiceText}>"Send 5k for sneakers"</Text>
              <Text style={styles.sampleVoiceSub}>Case 2: Ambiguity check</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sampleVoiceBtn}
              onPress={() => handleVoiceCommand('Collect money from everybody')}
            >
              <Text style={styles.sampleVoiceText}>"Collect from everybody"</Text>
              <Text style={styles.sampleVoiceSub}>Case 3: Sweeps Korope BLE</Text>
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

      {/* MODAL 3: PAYPAL TIME-LOCKED MARKET VAULT & ESCROW */}
      <Modal visible={isPayPalEscrowOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.paypalCard}>
            <View style={styles.voiceHeader}>
              <Text style={styles.paypalTitle}>PayPal Market Vault</Text>
              <TouchableOpacity onPress={() => setIsPayPalEscrowOpen(false)}>
                <Text style={styles.drawerClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.paypalSub}>
              Pre-Authorize an offline budget on PayPal servers before entering blackout zones. Zero double-spend fraud!
            </Text>

            {/* Sub-tabs */}
            <View style={styles.tabRow}>
              <TouchableOpacity
                style={[styles.tabItem, activeEscrowTab === 'vault' && styles.tabActive]}
                onPress={() => setActiveEscrowTab('vault')}
              >
                <Text style={[styles.tabText, activeEscrowTab === 'vault' && styles.tabTextActive]}>
                  Market Vault
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabItem, activeEscrowTab === 'tokens' && styles.tabActive]}
                onPress={() => setActiveEscrowTab('tokens')}
              >
                <Text style={[styles.tabText, activeEscrowTab === 'tokens' && styles.tabTextActive]}>
                  Tokens
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabItem, activeEscrowTab === 'direct' && styles.tabActive]}
                onPress={() => setActiveEscrowTab('direct')}
              >
                <Text style={[styles.tabText, activeEscrowTab === 'direct' && styles.tabTextActive]}>
                  PayPal Direct
                </Text>
              </TouchableOpacity>
            </View>

            {activeEscrowTab === 'vault' && (
              <View>
                {isVaultLocked ? (
                  <View style={styles.activeVaultBox}>
                    <View style={styles.caseBadgeRow}>
                      <Text style={styles.vaultActiveTitle}>🔒 VAULT PRE-AUTH ACTIVE</Text>
                      <Text style={styles.vaultCountdown}>{vaultCountdown}</Text>
                    </View>
                    <Text style={styles.vaultRemText}>
                      Remaining: ₦{vaultRemaining.toLocaleString()} / ₦{vaultAllocated.toLocaleString()}
                    </Text>
                    <Text style={styles.vaultKeyText}>Lock: {vaultPreAuthId}</Text>

                    <TouchableOpacity
                      style={[styles.actionBtn, { marginTop: 10 }]}
                      onPress={handleSimulateVaultSpend}
                    >
                      <Text style={styles.actionBtnText}>
                        Simulate Spend ₦2,000 at Mama Nkechi
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: '#7f1d1d', marginTop: 8 }]}
                      onPress={handleAutoMelt}
                    >
                      <Text style={styles.actionBtnText}>
                        Auto-Melt Unspent Back to PayPal
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View>
                    <Text style={styles.vaultFormLabel}>Select Offline Budget:</Text>
                    <View style={styles.amountSelector}>
                      {[5000, 10000, 25000].map((amt) => (
                        <TouchableOpacity
                          key={amt}
                          style={[
                            styles.amountPill,
                            vaultAllocated === amt && styles.amountPillActive,
                          ]}
                          onPress={() => setVaultAllocated(amt)}
                        >
                          <Text style={styles.amountText}>₦{amt.toLocaleString()}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <Text style={[styles.vaultFormLabel, { marginTop: 10 }]}>Duration Lock:</Text>
                    <View style={styles.amountSelector}>
                      {[5, 24].map((hrs) => (
                        <TouchableOpacity
                          key={hrs}
                          style={[
                            styles.amountPill,
                            vaultDurationHours === hrs && styles.amountPillActive,
                          ]}
                          onPress={() => setVaultDurationHours(hrs)}
                        >
                          <Text style={styles.amountText}>{hrs} Hours</Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <TouchableOpacity
                      style={[styles.paypalActionBtn, { marginTop: 14 }]}
                      onPress={() => handleLockVault(vaultAllocated, vaultDurationHours)}
                    >
                      <Text style={styles.paypalActionText}>
                        Lock ₦{vaultAllocated.toLocaleString()} on PayPal
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {activeEscrowTab === 'tokens' && (
              <View>
                <Text style={styles.vaultRemText}>
                  Opportunistic Clearing: Whichever peer reconnects transmits the cryptogram.
                </Text>
                <TouchableOpacity
                  style={[styles.paypalActionBtn, { marginTop: 12 }]}
                  onPress={() => {
                    showToast('Transmitted pending vouchers to PayPal APIs.');
                    setIsPayPalEscrowOpen(false);
                  }}
                >
                  <Text style={styles.paypalActionText}>Sync All Tokens Now</Text>
                </TouchableOpacity>
              </View>
            )}

            {activeEscrowTab === 'direct' && (
              <View>
                <Text style={styles.vaultRemText}>
                  Linked Account: malik.olajuwon@tpay.ng
                </Text>
                <Text style={styles.vaultKeyText}>PayPal USD Balance: $1,420.50</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setIsPayPalEscrowOpen(false)}
            >
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 4: END-OF-DAY RECONCILIATION AUDIT (MAMA NKECHI) */}
      <Modal visible={isAuditModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.voiceCard}>
            <View style={styles.voiceHeader}>
              <Text style={styles.voiceTitle}>Daily Stock Review & Audit</Text>
              <TouchableOpacity onPress={() => setIsAuditModalOpen(false)}>
                <Text style={styles.drawerClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.voiceSub}>
              End-of-day physical stock count vs voice logged sales.
            </Text>

            <View style={styles.aiSpeechBubble}>
              <Text style={styles.aiSpeechLabel}>Audio Readout for Merchant:</Text>
              <Text style={styles.aiSpeechText}>
                "Mama Nkechi, your stock review is ready. You have {cokeStock} bottles of Coke and {maltinaStock} cans of Maltina remaining. Cash sales of ₦{cashSales.toLocaleString()} confirmed."
              </Text>
            </View>

            <View style={styles.auditRow}>
              <Text style={styles.auditLabel}>Coke 50cl Pet:</Text>
              <Text style={styles.auditValue}>{cokeStock} bottles (Matched ✓)</Text>
            </View>
            <View style={styles.auditRow}>
              <Text style={styles.auditLabel}>Maltina 33cl Can:</Text>
              <Text style={styles.auditValue}>{maltinaStock} cans (Matched ✓)</Text>
            </View>
            <View style={styles.auditRow}>
              <Text style={styles.auditLabel}>Cash Collected:</Text>
              <Text style={[styles.auditValue, { color: '#34d399' }]}>
                ₦{cashSales.toLocaleString()} (0 Discrepancy ✓)
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.actionBtn, { marginTop: 14 }]}
              onPress={() => {
                showToast('Daily audit confirmed and locked in merchant ledger.');
                setIsAuditModalOpen(false);
              }}
            >
              <Text style={styles.actionBtnText}>Confirm & Close Day</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 5: AMBIGUITY RESOLUTION (SALARY EARNER) */}
      <Modal visible={isAmbiguityModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.voiceCard}>
            <Text style={styles.voiceTitle}>AI Ambiguity Resolution</Text>
            <Text style={styles.voiceSub}>
              You said: "Send 5k for sneakers". T-Pay AI wants to know how to categorize this:
            </Text>

            <View style={styles.aiSpeechBubble}>
              <Text style={styles.aiSpeechText}>
                "Wait o! This ₦5,000 for sneakers, make I put am under Food, Transport, or Upkeep?"
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.actionBtn, { marginTop: 10, backgroundColor: '#dc2626' }]}
              onPress={() => handleResolveAmbiguity('food')}
            >
              <Text style={styles.actionBtnText}>Classify as Food</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { marginTop: 8, backgroundColor: '#2563eb' }]}
              onPress={() => handleResolveAmbiguity('transport')}
            >
              <Text style={styles.actionBtnText}>Classify as Transport</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { marginTop: 8, backgroundColor: '#7c3aed' }]}
              onPress={() => handleResolveAmbiguity('upkeep')}
            >
              <Text style={styles.actionBtnText}>Classify as Upkeep (Recommended)</Text>
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
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
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
    gap: 6,
  },
  pitchPill: {
    backgroundColor: '#7f1d1d',
    borderColor: '#ef4444',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  pitchPillText: {
    color: '#fca5a5',
    fontSize: 10,
    fontWeight: 'bold',
  },
  paypalPill: {
    backgroundColor: '#0c4a6e',
    borderColor: '#0284c7',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  paypalPillText: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: 'bold',
  },
  iconBtn: {
    padding: 7,
    borderRadius: 8,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
  },
  zapIcon: {
    color: '#ef4444',
    fontSize: 13,
  },
  hamburgerBtn: {
    padding: 7,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#475569',
  },
  hamburgerIcon: {
    color: '#cbd5e1',
    fontSize: 14,
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
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
    marginRight: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tLogo: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tLogoText: {
    color: '#ffffff',
    fontSize: 15,
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
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
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
    marginVertical: 12,
  },
  circleButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
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
    marginTop: 6,
  },
  tapSubText: {
    color: '#475569',
    fontSize: 10,
  },
  quickGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  gridBtn: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 10,
    borderRadius: 14,
    alignItems: 'center',
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  gridBtnIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  gridBtnText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '600',
  },
  innerView: {
    paddingVertical: 6,
  },
  viewTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
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
    borderRadius: 12,
    padding: 3,
    marginBottom: 12,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 9,
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
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 12,
  },
  caseBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  caseHeading: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  liveBadge: {
    color: '#f87171',
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    backgroundColor: '#450a0a',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  caseSub: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 12,
  },
  stockGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 12,
  },
  stockItem: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  stockLabel: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '600',
  },
  stockValue: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    marginVertical: 2,
  },
  stockPrice: {
    color: '#64748b',
    fontSize: 9,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  budgetLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  budgetValue: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#1e293b',
    borderRadius: 3,
    marginVertical: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ef4444',
    borderRadius: 3,
  },
  seatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  seatBadge: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: '22%',
  },
  seatPaid: {
    backgroundColor: '#064e3b',
    borderColor: '#10b981',
  },
  seatUnpaid: {
    backgroundColor: '#450a0a',
    borderColor: '#ef4444',
  },
  seatNum: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  seatStatus: {
    color: '#cbd5e1',
    fontSize: 8,
    fontWeight: 'bold',
  },
  manifestSummary: {
    marginBottom: 10,
    backgroundColor: '#020617',
    padding: 8,
    borderRadius: 8,
  },
  manifestText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  actionBtn: {
    backgroundColor: '#dc2626',
    padding: 11,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 11,
  },
  pitchDeckContainer: {
    gap: 10,
  },
  deckCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  deckSlideNum: {
    color: '#ef4444',
    fontSize: 9,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  deckSlideTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  deckSlideBody: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 16,
  },
  bulletItem: {
    color: '#cbd5e1',
    fontSize: 11,
    lineHeight: 18,
    marginBottom: 4,
  },
  dashCard: {
    backgroundColor: '#0f172a',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  dashLabel: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: 'bold',
  },
  dashAmount: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 6,
  },
  dashGrowth: {
    color: '#34d399',
    fontSize: 11,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  historyTitle: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  historySub: {
    color: '#64748b',
    fontSize: 9,
    fontFamily: 'monospace',
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
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  drawerTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  drawerClose: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuItem: {
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  menuItemActive: {
    backgroundColor: '#450a0a',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  menuItemText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  paypalDrawerBtn: {
    backgroundColor: '#0369a1',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  paypalDrawerText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 11,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  voiceCard: {
    backgroundColor: '#0f172a',
    borderRadius: 22,
    padding: 18,
    width: '100%',
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  voiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  voiceTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  voiceSub: {
    color: '#94a3b8',
    fontSize: 10,
    marginBottom: 10,
  },
  dialectRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 10,
  },
  dialectPill: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  dialectPillActive: {
    backgroundColor: '#dc2626',
    borderColor: '#ef4444',
  },
  dialectText: {
    color: '#94a3b8',
    fontSize: 8,
    fontWeight: 'bold',
  },
  dialectTextActive: {
    color: '#ffffff',
  },
  aiSpeechBubble: {
    backgroundColor: '#450a0a',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ef4444',
    marginBottom: 10,
  },
  aiSpeechLabel: {
    color: '#fca5a5',
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  aiSpeechText: {
    color: '#ffffff',
    fontSize: 11,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  sampleHeader: {
    color: '#64748b',
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  sampleVoiceBtn: {
    backgroundColor: '#1e293b',
    padding: 9,
    borderRadius: 10,
    marginBottom: 6,
  },
  sampleVoiceText: {
    color: '#f87171',
    fontSize: 11,
    fontWeight: 'bold',
  },
  sampleVoiceSub: {
    color: '#64748b',
    fontSize: 9,
  },
  closeBtn: {
    marginTop: 8,
    padding: 10,
    backgroundColor: '#334155',
    borderRadius: 10,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 11,
  },
  paypalCard: {
    backgroundColor: '#082f49',
    borderRadius: 22,
    padding: 18,
    width: '100%',
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#0284c7',
  },
  paypalTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  paypalSub: {
    color: '#bae6fd',
    fontSize: 10,
    lineHeight: 14,
    marginBottom: 10,
  },
  activeVaultBox: {
    backgroundColor: '#0c4a6e',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  vaultActiveTitle: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  vaultCountdown: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  vaultRemText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  vaultKeyText: {
    color: '#bae6fd',
    fontSize: 9,
    fontFamily: 'monospace',
  },
  vaultFormLabel: {
    color: '#bae6fd',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 6,
  },
  amountSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  amountPill: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#0c4a6e',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0284c7',
  },
  amountPillActive: {
    backgroundColor: '#0284c7',
    borderColor: '#38bdf8',
  },
  amountText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  paypalActionBtn: {
    backgroundColor: '#0284c7',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  paypalActionText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 11,
  },
  auditRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  auditLabel: {
    color: '#94a3b8',
    fontSize: 11,
  },
  auditValue: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  toast: {
    backgroundColor: '#064e3b',
    padding: 8,
    marginHorizontal: 16,
    marginTop: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#059669',
  },
  toastText: {
    color: '#6ee7b7',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
