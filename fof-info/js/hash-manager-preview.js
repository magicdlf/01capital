import { renderInvestorSummarySection } from './modules/investor-summary-view.js';

function buildUserDataUrl(hashFile) {
    let f = (hashFile || '').trim();
    if (!f.endsWith('.json')) {
        f += '.json';
    }
    return `https://data.01capital.info/arbcus/${f}?t=${Date.now()}`;
}

async function loadInvestorPreview() {
    const username = document.getElementById('previewUsername').value.trim();
    const hashFile = document.getElementById('previewHashFile').value.trim();
    const statusEl = document.getElementById('previewStatus');
    const mount = document.getElementById('hashManagerInvestorMount');
    const section = document.getElementById('investorPreviewSection');

    if (!username || !hashFile) {
        if (statusEl) {
            statusEl.textContent = '请输入用户名和 Shared Secret 文件名';
            statusEl.className = 'text-danger small mt-2';
        }
        return;
    }

    if (statusEl) {
        statusEl.textContent = '加载中…';
        statusEl.className = 'text-muted small mt-2';
    }

    try {
        const response = await fetch(buildUserDataUrl(hashFile), {
            method: 'GET',
            mode: 'cors',
            credentials: 'omit',
            headers: { Accept: 'application/json' }
        });

        if (!response.ok) {
            if (statusEl) {
                statusEl.textContent = '无法加载用户数据，请检查文件名是否正确';
                statusEl.className = 'text-danger small mt-2';
            }
            if (mount) mount.innerHTML = '';
            return;
        }

        const userData = await response.json();
        if (!userData.investments) {
            if (statusEl) {
                statusEl.textContent = '用户数据格式无效（缺少 investments）';
                statusEl.className = 'text-danger small mt-2';
            }
            return;
        }

        section.style.display = 'block';
        mount.innerHTML = '';
        renderInvestorSummarySection(mount, userData, username, { showActionButtons: false });

        if (statusEl) {
            statusEl.textContent = '已加载：与主站「投资者专区」一致（预览模式不包含币种转换投资、赎回申请）';
            statusEl.className = 'text-success small mt-2';
        }
    } catch (err) {
        if (statusEl) {
            statusEl.textContent = '加载失败：' + (err && err.message ? err.message : String(err));
            statusEl.className = 'text-danger small mt-2';
        }
    }
}

function bindPreviewButton() {
    const btn = document.getElementById('loadInvestorPreviewBtn');
    if (btn) btn.addEventListener('click', loadInvestorPreview);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindPreviewButton);
} else {
    bindPreviewButton();
}
