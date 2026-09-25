import {
  resolveSenderIdentity,
  authorizeChatRoomAccess,
  validateAndSanitizeMessage,
  checkChatMessageRateLimit,
  MAX_CHAT_MESSAGE_LENGTH
} from './chatSecurityService.js';
import { AuthenticatedUserContext } from '../auth/adminAuthMiddleware.js';
import { DEFAULT_CHAT_ROOMS } from '../../lib/defaultChatData.js';

/**
 * ============================================================================
 * CAFFEINE 2.1 CHAT AUTHENTICATION, AUTHORIZATION & IDOR/BOLA TEST SUITE
 * ============================================================================
 * Standard AI Code Tags:
 * // [SECURITY_LAYER: CHAT_TEST_SUITE]
 * // [DEFENSE: CHAT_IDENTITY_SPOOFING_TEST]
 * // [DEFENSE: CHAT_BOLA_IDOR_TEST]
 * // [DEFENSE: CHAT_RATE_LIMIT_TEST]
 * ============================================================================
 */

export interface ChatTestCaseResult {
  id: string;
  name: string;
  category: 'IDENTITY_SPOOFING' | 'BOLA_IDOR' | 'RBAC_ACCESS' | 'PAYLOAD_VALIDATION' | 'RATE_LIMITING';
  passed: boolean;
  details: string;
  metadata?: Record<string, any>;
}

export interface ChatTestSuiteReport {
  timestamp: string;
  status: 'PASSED' | 'FAILED';
  totalTests: number;
  passedTests: number;
  failedTests: number;
  tests: ChatTestCaseResult[];
}

export function runChatSecurityTests(): ChatTestSuiteReport {
  const tests: ChatTestCaseResult[] = [];

  // Helper mock request generator
  const createMockReq = (authUser: AuthenticatedUserContext | null, ip: string = '192.168.1.50'): any => ({
    authUser,
    ip,
    headers: { 'user-agent': 'Caffeine-Security-Agent/2.1' },
    cookies: {}
  });

  // -------------------------------------------------------------
  // Test 1: Identity Spoofing Prevention for Authenticated Users
  // -------------------------------------------------------------
  {
    const studentUser: AuthenticatedUserContext = {
      id: 'usr-std-101',
      studentId: 'std-101',
      name: 'آرین محمدی',
      role: 'student',
      username: 'arian_m'
    };
    const mockReq = createMockReq(studentUser);

    // Attacker sends body claiming to be admin
    const spoofedBody = {
      senderId: 'usr-admin-999',
      senderName: 'مدیر ارشد آکادمی',
      senderRole: 'admin',
      senderBadge: 'مدیریت کل',
      text: 'پیام جعلی با هویت مدیریت'
    };

    const resolved = resolveSenderIdentity(mockReq, spoofedBody);

    const passed =
      resolved.senderId === 'std-101' &&
      resolved.senderRole === 'student' &&
      resolved.senderName === 'آرین محمدی' &&
      resolved.isAuthenticated === true;

    tests.push({
      id: 'CHAT-SEC-01',
      name: 'جلوگیری از جعل هویت فرستنده در کاربران لاگین‌شده (Sender Identity Spoofing Defense)',
      category: 'IDENTITY_SPOOFING',
      passed,
      details: passed
        ? 'مشخصات فرستنده (شناسه، نقش و نام) صرفاً از سشن تاییدشده سرور استخراج شد و مقادیر جعلی ارسالی کلاینت نادیده گرفته شدند.'
        : 'هشدار: کلاینت توانست نقش یا شناسه فرستنده را جعل نماید.',
      metadata: { resolvedRole: resolved.senderRole, resolvedId: resolved.senderId }
    });
  }

  // -------------------------------------------------------------
  // Test 2: Anonymous User Server-Authoritative Identity Derivation
  // -------------------------------------------------------------
  {
    const mockReq = createMockReq(null, '10.0.0.99');
    const spoofedGuestBody = {
      senderId: 'adv-kazemi',
      senderName: 'دکتر علیرضا کاظمی',
      senderRole: 'advisor',
      text: 'تلاش برای جعل هویت مشاور بدون احراز هویت'
    };

    const resolved = resolveSenderIdentity(mockReq, spoofedGuestBody);

    const passed =
      resolved.senderRole === 'guest' &&
      resolved.senderId.startsWith('anon-guest-') &&
      resolved.senderId !== 'adv-kazemi' &&
      resolved.isAuthenticated === false;

    tests.push({
      id: 'CHAT-SEC-02',
      name: 'صدور هویت سروری امن برای کاربران مهمان (Anonymous Identity Enforcement)',
      category: 'IDENTITY_SPOOFING',
      passed,
      details: passed
        ? 'برای کاربر بدون احراز هویت، هویت یکتای مهمان تولید شده و نقش او به صورت قطعی به guest محدود گردید.'
        : 'هشدار: کاربر ناشناس توانست خود را مشاور جا بزند.',
      metadata: { guestId: resolved.senderId, guestRole: resolved.senderRole }
    });
  }

  // -------------------------------------------------------------
  // Test 3: BOLA/IDOR Defense on Private Support Rooms (Student Isolation)
  // -------------------------------------------------------------
  {
    const student1: AuthenticatedUserContext = {
      id: 'usr-std-101',
      studentId: 'std-101',
      name: 'آرین محمدی',
      role: 'student'
    };

    const supportRoomStd102 = {
      id: 'dm-support-std-102',
      name: 'پشتیبانی سحر تهرانی',
      type: 'direct',
      category: 'direct',
      isSupportRoom: true,
      studentId: 'std-102',
      participants: ['std-102', 'admin']
    };

    const readCheck = authorizeChatRoomAccess(student1, supportRoomStd102, 'read');
    const writeCheck = authorizeChatRoomAccess(student1, supportRoomStd102, 'write');

    const passed = !readCheck.allowed && readCheck.statusCode === 403 && !writeCheck.allowed && writeCheck.statusCode === 403;

    tests.push({
      id: 'CHAT-SEC-03',
      name: 'محافظت در برابر BOLA/IDOR و ایزولاسیون چت‌های خصوصی دانش‌آموزان (Student Chat BOLA Guard)',
      category: 'BOLA_IDOR',
      passed,
      details: passed
        ? 'تلاش دانش‌آموز A برای خواندن یا نوشتن در چت خصوصی پشتیبانی دانش‌آموز B با خطای ۴۰۳ مسدود شد.'
        : 'هشدار آسیب‌پذیری IDOR: دانش‌آموز توانست به چت خصوصی دیگری دسترسی پیدا کند.',
      metadata: { readStatus: readCheck.statusCode, writeStatus: writeCheck.statusCode }
    });
  }

  // -------------------------------------------------------------
  // Test 4: Parent Authorization & Child Chat Boundary Isolation
  // -------------------------------------------------------------
  {
    const parentOf101: AuthenticatedUserContext = {
      id: 'usr-parent-101',
      name: 'ولی آرین محمدی',
      role: 'parent',
      childStudentId: 'std-101'
    };

    const roomChild = {
      id: 'dm-support-std-101',
      isSupportRoom: true,
      studentId: 'std-101',
      participants: ['std-101', 'admin']
    };

    const roomOtherChild = {
      id: 'dm-support-std-103',
      isSupportRoom: true,
      studentId: 'std-103',
      participants: ['std-103', 'admin']
    };

    const childCheck = authorizeChatRoomAccess(parentOf101, roomChild, 'read');
    const otherChildCheck = authorizeChatRoomAccess(parentOf101, roomOtherChild, 'read');

    const passed = childCheck.allowed && !otherChildCheck.allowed && otherChildCheck.statusCode === 403;

    tests.push({
      id: 'CHAT-SEC-04',
      name: 'کنترل دسترسی اولیا و محدودیت اکید به پرونده چت فرزند خود (Parent-Child Chat Access Isolation)',
      category: 'BOLA_IDOR',
      passed,
      details: passed
        ? 'ولی دانش‌آموز به چت پشتیبانی فرزند خود دسترسی داشته اما دسترسی به چت سایر دانش‌آموزان با ۴۰۳ مسدود گردید.'
        : 'هشدار: والد توانست به چت فرزند سایر اولیا دسترسی پیدا کند.',
      metadata: { ownChildAllowed: childCheck.allowed, otherChildAllowed: otherChildCheck.allowed }
    });
  }

  // -------------------------------------------------------------
  // Test 5: Announcement Channel Write Protection (RBAC)
  // -------------------------------------------------------------
  {
    const studentUser: AuthenticatedUserContext = {
      id: 'usr-std-101',
      studentId: 'std-101',
      name: 'آرین محمدی',
      role: 'student'
    };

    const advisorUser: AuthenticatedUserContext = {
      id: 'usr-adv-kazemi',
      advisorId: 'adv-kazemi',
      name: 'دکتر علیرضا کاظمی',
      role: 'advisor'
    };

    const announcementsRoom = DEFAULT_CHAT_ROOMS.find((r) => r.id === 'room-announcements');

    const studentWrite = authorizeChatRoomAccess(studentUser, announcementsRoom, 'write');
    const advisorWrite = authorizeChatRoomAccess(advisorUser, announcementsRoom, 'write');
    const studentRead = authorizeChatRoomAccess(studentUser, announcementsRoom, 'read');

    const passed = !studentWrite.allowed && studentWrite.statusCode === 403 && advisorWrite.allowed && studentRead.allowed;

    tests.push({
      id: 'CHAT-SEC-05',
      name: 'حفاظت از کانال اعلانات رسمی در برابر ارسال پیام کاربران عادی (Announcement Write Protection)',
      category: 'RBAC_ACCESS',
      passed,
      details: passed
        ? 'کانال اعلانات برای همه قابل خواندن است اما ارسال پیام صرفاً به مدیران و مشاوران ارشد محدود شده است.'
        : 'هشدار: دانش‌آموز توانست در کانال اعلانات پیام ارسال کند.'
    });
  }

  // -------------------------------------------------------------
  // Test 6: Message Size Limits & Memory Flood Protection
  // -------------------------------------------------------------
  {
    const hugeText = 'A'.repeat(MAX_CHAT_MESSAGE_LENGTH + 500);
    const resultOversized = validateAndSanitizeMessage({ text: hugeText });
    const normalText = 'سلام، سوال من در مورد تست شماره ۴ آزمون شیمی است.';
    const resultNormal = validateAndSanitizeMessage({ text: normalText });

    const passed = !resultOversized.valid && resultNormal.valid;

    tests.push({
      id: 'CHAT-SEC-06',
      name: 'اعمال سقف طول کاراکتر پیام و جلوگیری از حملات پرکردن حافظه (Message Size Limit)',
      category: 'PAYLOAD_VALIDATION',
      passed,
      details: passed
        ? `پیام‌های فراتر از سقف ${MAX_CHAT_MESSAGE_LENGTH} کاراکتر مسدود شدند و پیام‌های استاندارد به درستی پذیرفته شدند.`
        : 'هشدار: پیام فراتر از سقف مجاز فیلتر نشد.'
    });
  }

  // -------------------------------------------------------------
  // Test 7: Dangerous Executable Attachment Blocking
  // -------------------------------------------------------------
  {
    const dangerousPayloads = [
      { text: 'عکس پیوست', attachmentUrl: 'https://cdn.caffeine.ir/exploit.exe', attachmentName: 'exploit.exe' },
      { text: 'فایل بکند', attachmentUrl: 'https://cdn.caffeine.ir/shell.php', attachmentName: 'shell.php' },
      { text: 'لینک جاوااسکریپت', attachmentUrl: 'javascript:alert(1)', attachmentName: 'test.jpg' }
    ];

    let allBlocked = true;
    for (const p of dangerousPayloads) {
      const res = validateAndSanitizeMessage(p);
      if (res.valid) {
        allBlocked = false;
        break;
      }
    }

    tests.push({
      id: 'CHAT-SEC-07',
      name: 'مسدودسازی پیوست‌های اجرایی و پروتکل‌های خطرناک در چت (Dangerous Attachment Blocking)',
      category: 'PAYLOAD_VALIDATION',
      passed: allBlocked,
      details: allBlocked
        ? 'فایل‌های دارای پسوندهای اجرایی (.exe, .php, .sh) و پروتکل‌های javascript: مسدود شدند.'
        : 'هشدار: پیوست مخرب پذیرفته شد.'
    });
  }

  // -------------------------------------------------------------
  // Test 8: Chat Message Rate Limiting Protection (Anti-Spam)
  // -------------------------------------------------------------
  {
    const mockReq = createMockReq(null, '198.51.100.22');
    const testUserId = 'test-spam-user';

    let rateLimitTriggered = false;
    for (let i = 0; i < 35; i++) {
      const check = checkChatMessageRateLimit(mockReq, testUserId);
      if (!check.allowed) {
        rateLimitTriggered = true;
        break;
      }
    }

    tests.push({
      id: 'CHAT-SEC-08',
      name: 'محدودسازی نرخ ارسال پیام و مقابله با اسپم چت (Chat Message Rate Limiting)',
      category: 'RATE_LIMITING',
      passed: rateLimitTriggered,
      details: rateLimitTriggered
        ? 'ارسال بیش از ۳۰ پیام در دقیقه توسط مکانیزم Sliding Window محدود و با خطای ۴۲۹ مواجه شد.'
        : 'هشدار: محدودیت نرخ ارسال پیام فعال نشد.'
    });
  }

  // -------------------------------------------------------------
  // Test 9: Pin Messages RBAC Verification
  // -------------------------------------------------------------
  {
    const studentUser: AuthenticatedUserContext = {
      id: 'usr-std-101',
      studentId: 'std-101',
      name: 'آرین محمدی',
      role: 'student'
    };
    const advisorUser: AuthenticatedUserContext = {
      id: 'usr-adv-kazemi',
      advisorId: 'adv-kazemi',
      name: 'دکتر علیرضا کاظمی',
      role: 'advisor'
    };

    const generalRoom = DEFAULT_CHAT_ROOMS.find((r) => r.id === 'room-general');
    const studentPin = authorizeChatRoomAccess(studentUser, generalRoom, 'pin');
    const advisorPin = authorizeChatRoomAccess(advisorUser, generalRoom, 'pin');

    const passed = !studentPin.allowed && studentPin.statusCode === 403 && advisorPin.allowed;

    tests.push({
      id: 'CHAT-SEC-09',
      name: 'کنترل نقش برای پین کردن پیام‌های تالار (Chat Message Pinning RBAC)',
      category: 'RBAC_ACCESS',
      passed,
      details: passed
        ? 'امکان پین کردن پیام‌ها صرفاً به مشاوران و مدیران اختصاص یافت و دسترسی کاربران عادی مسدود شد.'
        : 'هشدار: دانش‌آموز توانست پیام را پین کند.'
    });
  }

  // -------------------------------------------------------------
  // Test 10: Academic/Specialized Channels Require Login (Security Fix)
  // -------------------------------------------------------------
  {
    const biologyRoom = DEFAULT_CHAT_ROOMS.find((r) => r.id === 'room-biology');
    const guestRead = authorizeChatRoomAccess(null, biologyRoom, 'read');
    const guestWrite = authorizeChatRoomAccess(null, biologyRoom, 'write');

    const studentUser: AuthenticatedUserContext = {
      id: 'usr-std-101',
      studentId: 'std-101',
      name: 'آرین محمدی',
      role: 'student'
    };
    const studentRead = authorizeChatRoomAccess(studentUser, biologyRoom, 'read');
    const studentWrite = authorizeChatRoomAccess(studentUser, biologyRoom, 'write');

    const passed =
      !guestRead.allowed &&
      guestRead.statusCode === 401 &&
      !guestWrite.allowed &&
      guestWrite.statusCode === 401 &&
      studentRead.allowed &&
      studentWrite.allowed;

    tests.push({
      id: 'CHAT-SEC-10',
      name: 'الزام ورود به حساب برای تالارهای درسی و تخصصی (Specialized Channels Authentication)',
      category: 'RBAC_ACCESS',
      passed,
      details: passed
        ? 'تالارهای تخصصی درسی (زیست، شیمی و ...) بدون ورود به حساب با خطای ۴۰۱ مسدود شدند و ورود به حساب اجباری گردید.'
        : 'هشدار امنیتی: کاربر مهمان توانست بدون احراز هویت به تالار تخصصی دسترسی یابد.'
    });
  }

  // -------------------------------------------------------------
  // Test 11: Guest Direct Chat Restricted Strictly to Support Room
  // -------------------------------------------------------------
  {
    const guestSupportRoom = {
      id: 'direct-support-guest',
      name: 'پشتیبانی آنلاین مهمان',
      type: 'direct',
      category: 'direct',
      isSupportRoom: true,
      directStudentId: 'guest'
    };

    const privateAdvisorDM = {
      id: 'direct-advisor-adv-1',
      name: 'چت اختصاصی مشاور',
      type: 'direct',
      category: 'direct',
      isSupportRoom: false,
      participants: ['adv-1', 'std-101']
    };

    const guestSupportCheck = authorizeChatRoomAccess(null, guestSupportRoom, 'write');
    const guestAdvisorDMCheck = authorizeChatRoomAccess(null, privateAdvisorDM, 'write');

    const passed =
      guestSupportCheck.allowed &&
      guestSupportCheck.statusCode === 200 &&
      !guestAdvisorDMCheck.allowed &&
      guestAdvisorDMCheck.statusCode === 401;

    tests.push({
      id: 'CHAT-SEC-11',
      name: 'محدودیت چت خصوصی مهمان صرفاً به پشتیبانی (Guest Direct Chat Restricted to Support)',
      category: 'BOLA_IDOR',
      passed,
      details: passed
        ? 'کاربر مهمان فقط به چت پشتیبانی دسترسی دارد و تلاش برای ورود به سایر چت‌های خصوصی با خطای ۴۰۱ مسدود شد.'
        : 'هشدار امنیتی: کاربر مهمان توانست به چت خصوصی خارج از پشتیبانی دسترسی پیدا کند.'
    });
  }

  // -------------------------------------------------------------
  // Test 12: Room Locking Mechanism (Admin/Advisor Lock Enforcement)
  // -------------------------------------------------------------
  {
    const lockedGeneralRoom = {
      id: 'room-general',
      name: 'تالار گفتگوی عمومی',
      category: 'general',
      type: 'channel',
      isLocked: true,
      approvalStatus: 'approved'
    };

    const studentUser: AuthenticatedUserContext = {
      id: 'usr-std-101',
      studentId: 'std-101',
      name: 'آرین محمدی',
      role: 'student'
    };

    const advisorUser: AuthenticatedUserContext = {
      id: 'usr-adv-kazemi',
      advisorId: 'adv-kazemi',
      name: 'دکتر علیرضا کاظمی',
      role: 'advisor'
    };

    const studentRead = authorizeChatRoomAccess(studentUser, lockedGeneralRoom, 'read');
    const studentWrite = authorizeChatRoomAccess(studentUser, lockedGeneralRoom, 'write');
    const guestWrite = authorizeChatRoomAccess(null, lockedGeneralRoom, 'write');
    const advisorWrite = authorizeChatRoomAccess(advisorUser, lockedGeneralRoom, 'write');

    const passed =
      studentRead.allowed &&
      !studentWrite.allowed &&
      studentWrite.statusCode === 403 &&
      !guestWrite.allowed &&
      guestWrite.statusCode === 403 &&
      advisorWrite.allowed;

    tests.push({
      id: 'CHAT-SEC-12',
      name: 'مکانیزم قفل تالار و مسدودسازی ارسال پیام کاربران در تالار قفل‌شده (Room Lock Defense)',
      category: 'RBAC_ACCESS',
      passed,
      details: passed
        ? 'در تالار قفل‌شده، پیام‌ها قابل خواندن هستند اما ارسال پیام توسط دانش‌آموز یا مهمان با ۴۰۳ مسدود و صرفاً مشاور/مدیر مجاز است.'
        : 'هشدار امنیتی: دانش‌آموز یا مهمان توانست در تالار قفل‌شده پیام ارسال کند.'
    });
  }

  // -------------------------------------------------------------
  // Test 13: Universal Support Chat Access For All User Categories
  // -------------------------------------------------------------
  {
    const studentUser: AuthenticatedUserContext = {
      id: 'usr-std-101',
      studentId: 'std-101',
      name: 'آرین محمدی',
      role: 'student'
    };
    const ownStudentSupportRoom = {
      id: 'direct-support-101',
      studentId: 'std-101',
      isSupportRoom: true,
      type: 'direct',
      category: 'direct'
    };
    const studentAccess = authorizeChatRoomAccess(studentUser, ownStudentSupportRoom, 'write');

    const parentUser: AuthenticatedUserContext = {
      id: 'usr-parent-01',
      childStudentId: 'std-101',
      name: 'ولی محمدی',
      role: 'parent'
    };
    const parentAccess = authorizeChatRoomAccess(parentUser, ownStudentSupportRoom, 'read');

    const guestSupportRoom = {
      id: 'direct-support-guest',
      directStudentId: 'guest',
      isSupportRoom: true,
      type: 'direct',
      category: 'direct'
    };
    const guestAccess = authorizeChatRoomAccess(null, guestSupportRoom, 'write');

    const passed = studentAccess.allowed && parentAccess.allowed && guestAccess.allowed;

    tests.push({
      id: 'CHAT-SEC-13',
      name: 'در دسترس بودن چت پشتیبانی برای تمامی کاربران اعم از مهمان، داوطلب و اولیا (Universal Support Chat Access)',
      category: 'RBAC_ACCESS',
      passed,
      details: passed
        ? 'تمامی کاربران (دانش‌آموز به چت خود، ولی به چت فرزند و کاربر مهمان به چت پشتیبانی مهمان) دسترسی کامل دارند.'
        : 'هشدار: دسترسی پشتیبانی برای برخی کاربران فراهم نیست.'
    });
  }

  // -------------------------------------------------------------
  // Test 14: Guest Write Blocking in Public Groups (Read-Only for Guests)
  // -------------------------------------------------------------
  {
    const generalRoom = {
      id: 'room-general',
      name: '☕ کافه کنکور کافئین (عمومی)',
      category: 'public',
      type: 'public',
      isLocked: false,
      approvalStatus: 'approved'
    };

    const guestRead = authorizeChatRoomAccess(null, generalRoom, 'read');
    const guestWrite = authorizeChatRoomAccess(null, generalRoom, 'write');

    const passed = guestRead.allowed && !guestWrite.allowed && guestWrite.statusCode === 401;

    tests.push({
      id: 'CHAT-SEC-14',
      name: 'ممنوعیت ارسال پیام در گروه‌ها و تالارهای عمومی برای کاربران مهمان (Guest Group Messaging Defense)',
      category: 'RBAC_ACCESS',
      passed,
      details: passed
        ? 'کاربر مهمان مجاز به مشاهده پیام‌های تالار عمومی است اما ارسال پیام نیازمند ورود به حساب کاربری بوده و با ۴۰۱ مسدود شد.'
        : 'هشدار امنیتی بحرانی: کاربر مهمان توانست در تالار عمومی پیام ارسال کند.'
    });
  }

  // -------------------------------------------------------------
  // Test 15: Guest Cannot Access Registered Student Support Room (PII Leakage Defense)
  // -------------------------------------------------------------
  {
    const studentSupportRoom = {
      id: 'direct-support-101',
      name: 'پشتیبانی و مشاوره تخصصی کافئین',
      studentId: '101',
      directStudentId: '101',
      isSupportRoom: true,
      type: 'direct',
      category: 'direct'
    };

    const guestRead = authorizeChatRoomAccess(null, studentSupportRoom, 'read');
    const guestWrite = authorizeChatRoomAccess(null, studentSupportRoom, 'write');

    const passed = !guestRead.allowed && guestRead.statusCode === 401 && !guestWrite.allowed && guestWrite.statusCode === 401;

    tests.push({
      id: 'CHAT-SEC-15',
      name: 'عدم افشای نام و پرونده دانش‌آموزان برای کاربران مهمان (Student Support Privacy & PII Defense)',
      category: 'BOLA_IDOR',
      passed,
      details: passed
        ? 'کاربر مهمان به هیچ عنوان امکان مشاهده نام یا پیام‌های چت پشتیبانی دانش‌آموز ثبت‌نام‌شده را ندارد.'
        : 'هشدار امنیتی بحرانی: نام یا چت دانش‌آموز برای کاربر مهمان افشا شد.'
    });
  }

  const passedTests = tests.filter((t) => t.passed).length;
  const failedTests = tests.length - passedTests;

  return {
    timestamp: new Date().toISOString(),
    status: failedTests === 0 ? 'PASSED' : 'FAILED',
    totalTests: tests.length,
    passedTests,
    failedTests,
    tests
  };
}
