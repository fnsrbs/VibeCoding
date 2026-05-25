import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE_URL = `file://${path.resolve(__dirname, 'index.html')}`;

const PASS = '✅';
const FAIL = '❌';
const PROBE = '🔍';

let passed = 0, failed = 0;

function log(icon, msg, detail = '') {
  console.log(`  ${icon} ${msg}${detail ? `\n     → ${detail}` : ''}`);
  if (icon === PASS) passed++;
  if (icon === FAIL) failed++;
}

const browser = await chromium.launch({ headless: false, slowMo: 300 });
const page    = await browser.newPage();
await page.goto(FILE_URL);

// localStorage 초기화 (이전 데이터 제거)
await page.evaluate(() => localStorage.clear());
await page.reload();

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  쇼핑 리스트 앱 자동 테스트');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// ──────────────────────────────────────
// 1. 아이템 추가
// ──────────────────────────────────────
console.log('📋 [1] 아이템 추가');

// 1-1. Enter 키로 추가
await page.fill('#input', '사과');
await page.press('#input', 'Enter');
const item1 = await page.locator('.item-text').first().textContent();
log(item1 === '사과' ? PASS : FAIL, 'Enter 키로 아이템 추가', `렌더된 텍스트: "${item1}"`);

// 1-2. + 버튼으로 추가
await page.fill('#input', '바나나');
await page.click('#add-btn');
const items = await page.locator('.item-text').allTextContents();
log(items.includes('바나나') ? PASS : FAIL, '+ 버튼으로 아이템 추가', `목록: [${items.join(', ')}]`);

// 1-3. 아이템 2개 추가 후 요약 텍스트 확인
const summary = await page.locator('#summary').textContent();
log(summary.includes('2') ? PASS : FAIL, '헤더 요약 카운트 갱신', `요약: "${summary}"`);

// 1-4. 공백만 입력 시 추가 안됨 (probe)
const beforeCount = await page.locator('.item').count();
await page.fill('#input', '   ');
await page.press('#input', 'Enter');
const afterCount = await page.locator('.item').count();
log(beforeCount === afterCount ? PASS : FAIL, `${PROBE} 공백만 입력 시 아이템 추가 안됨`, `이전: ${beforeCount}개, 이후: ${afterCount}개`);

// 1-5. 입력 후 input 필드 초기화
const inputVal = await page.inputValue('#input');
log(inputVal === '' ? PASS : FAIL, '추가 후 입력 필드 초기화', `입력값: "${inputVal}"`);

// ──────────────────────────────────────
// 2. 체크 기능
// ──────────────────────────────────────
console.log('\n📋 [2] 체크(완료) 기능');

// 2-1. 첫 번째 아이템 체크
const firstCheckbox = page.locator('.checkbox').first();
await firstCheckbox.click();
const isChecked = await page.locator('.item').first().evaluate(el => el.classList.contains('checked'));
log(isChecked ? PASS : FAIL, '아이템 체크 → checked 클래스 적용');

// 2-2. 체크된 아이템에 취소선 적용 확인
const textDecoration = await page.locator('.item.checked .item-text').first()
  .evaluate(el => getComputedStyle(el).textDecorationLine);
log(textDecoration.includes('line-through') ? PASS : FAIL, '체크 시 텍스트에 취소선 적용', `text-decoration: ${textDecoration}`);

// 2-3. 완료 카운트 반영
const summaryAfterCheck = await page.locator('#summary').textContent();
log(summaryAfterCheck.includes('완료 1') ? PASS : FAIL, '체크 후 완료 카운트 갱신', `요약: "${summaryAfterCheck}"`);

// 2-4. 재클릭으로 체크 해제 (probe)
await firstCheckbox.click();
const isUnchecked = await page.locator('.item').first().evaluate(el => !el.classList.contains('checked'));
log(isUnchecked ? PASS : FAIL, `${PROBE} 재클릭으로 체크 해제`, `checked: ${!isUnchecked}`);

// ──────────────────────────────────────
// 3. 삭제 기능
// ──────────────────────────────────────
console.log('\n📋 [3] 아이템 삭제');

// 3-1. 삭제 버튼 클릭 (hover 후 삭제)
const countBefore = await page.locator('.item').count();
const firstItem = page.locator('.item').first();
await firstItem.hover();
await firstItem.locator('.delete-btn').click();
const countAfter = await page.locator('.item').count();
log(countAfter === countBefore - 1 ? PASS : FAIL, '삭제 버튼 클릭 시 아이템 제거', `삭제 전: ${countBefore}개, 삭제 후: ${countAfter}개`);

// 3-2. 삭제 후 요약 카운트 갱신
const summaryAfterDelete = await page.locator('#summary').textContent();
log(summaryAfterDelete.includes('1') ? PASS : FAIL, '삭제 후 헤더 카운트 갱신', `요약: "${summaryAfterDelete}"`);

// ──────────────────────────────────────
// 4. 필터 기능
// ──────────────────────────────────────
console.log('\n📋 [4] 필터 기능');

// 아이템 더 추가 (완료/미완료 섞기)
await page.fill('#input', '우유'); await page.press('#input', 'Enter');
await page.fill('#input', '달걀'); await page.press('#input', 'Enter');
// 첫 아이템 체크
await page.locator('.checkbox').first().click();

// 4-1. 미완료 필터
await page.click('[data-filter="active"]');
const activeItems = await page.locator('.item').count();
const activeHasChecked = await page.locator('.item.checked').count();
log(activeHasChecked === 0 ? PASS : FAIL, '미완료 필터 → 완료 아이템 숨김', `표시: ${activeItems}개, 그 중 완료: ${activeHasChecked}개`);

// 4-2. 완료 필터
await page.click('[data-filter="checked"]');
const checkedItems = await page.locator('.item').count();
const checkedAllDone = await page.locator('.item:not(.checked)').count();
log(checkedAllDone === 0 && checkedItems > 0 ? PASS : FAIL, '완료 필터 → 완료 아이템만 표시', `표시: ${checkedItems}개`);

// 4-3. 전체 필터 복귀
await page.click('[data-filter="all"]');
const allItems = await page.locator('.item').count();
log(allItems > checkedItems ? PASS : FAIL, '전체 필터 → 모든 아이템 표시', `전체: ${allItems}개`);

// ──────────────────────────────────────
// 5. 완료 항목 일괄 삭제
// ──────────────────────────────────────
console.log('\n📋 [5] 완료 항목 일괄 삭제');

const totalBefore = await page.locator('.item').count();
const checkedBefore = await page.locator('.item.checked').count();
await page.click('#clear-btn');
const totalAfter = await page.locator('.item').count();
log(totalAfter === totalBefore - checkedBefore ? PASS : FAIL,
  '완료 항목 일괄 삭제', `삭제 전: ${totalBefore}개(완료 ${checkedBefore}개), 삭제 후: ${totalAfter}개`);

// 5-1. 완료 항목 없을 때 버튼 비활성화 (probe)
const isDisabled = await page.locator('#clear-btn').evaluate(el => el.disabled);
log(isDisabled ? PASS : FAIL, `${PROBE} 완료 항목 없으면 일괄 삭제 버튼 비활성화`);

// ──────────────────────────────────────
// 6. localStorage 영속성
// ──────────────────────────────────────
console.log('\n📋 [6] localStorage 영속성');

const itemsBeforeReload = await page.locator('.item-text').allTextContents();
await page.reload();
const itemsAfterReload = await page.locator('.item-text').allTextContents();
const sameItems = JSON.stringify(itemsBeforeReload) === JSON.stringify(itemsAfterReload);
log(sameItems ? PASS : FAIL, '새로고침 후 데이터 유지',
  `리로드 전: [${itemsBeforeReload.join(', ')}] → 리로드 후: [${itemsAfterReload.join(', ')}]`);

// ──────────────────────────────────────
// 결과
// ──────────────────────────────────────
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`  결과: ${passed + failed}개 테스트 중 ${PASS} ${passed}개 통과, ${FAIL} ${failed}개 실패`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

await browser.close();
process.exit(failed > 0 ? 1 : 0);
