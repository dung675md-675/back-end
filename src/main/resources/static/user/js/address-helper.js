// Helper to initialize custom address selection with provinces.open-api.vn

const AddressHelper = {
    // Endpoints
    apiHost: "https://provinces.open-api.vn/api/",

    init: async function (provinceSelectId, districtSelectId, wardSelectId, preselectedData = null) {
        const provinceSelect = document.getElementById(provinceSelectId);
        const districtSelect = document.getElementById(districtSelectId);
        const wardSelect = document.getElementById(wardSelectId);

        if (!provinceSelect || !districtSelect || !wardSelect) return;

        // Fetch provinces
        try {
            const res = await fetch(`${this.apiHost}?depth=1`);
            const provinces = await res.json();
            
            // Clear and populate
            provinceSelect.innerHTML = '<option value="">-- Chọn Tỉnh/Thành phố --</option>';
            provinces.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.code;
                opt.text = p.name;
                opt.dataset.name = p.name;
                provinceSelect.add(opt);
            });

            // Handle Province Change
            provinceSelect.addEventListener('change', async function() {
                const pCode = this.value;
                districtSelect.innerHTML = '<option value="">-- Chọn Quận/Huyện --</option>';
                wardSelect.innerHTML = '<option value="">-- Chọn Phường/Xã --</option>';
                districtSelect.disabled = !pCode;
                wardSelect.disabled = true;

                if (pCode) {
                    const dRes = await fetch(`${AddressHelper.apiHost}p/${pCode}?depth=2`);
                    const dData = await dRes.json();
                    dData.districts.forEach(d => {
                        const opt = document.createElement('option');
                        opt.value = d.code;
                        opt.text = d.name;
                        opt.dataset.name = d.name;
                        districtSelect.add(opt);
                    });
                }
            });

            // Handle District Change
            districtSelect.addEventListener('change', async function() {
                const dCode = this.value;
                wardSelect.innerHTML = '<option value="">-- Chọn Phường/Xã --</option>';
                wardSelect.disabled = !dCode;

                if (dCode) {
                    const wRes = await fetch(`${AddressHelper.apiHost}d/${dCode}?depth=2`);
                    const wData = await wRes.json();
                    wData.wards.forEach(w => {
                        const opt = document.createElement('option');
                        opt.value = w.code;
                        opt.text = w.name;
                        opt.dataset.name = w.name;
                        wardSelect.add(opt);
                    });
                }
            });

            // Preselect if data is provided (Not yet implemented fully for auto-loading but structure is ready)
            if (preselectedData) {
                // Implementation for preselecting would require finding the matching names, which is a bit complex 
                // due to string matching variations ("TP. Hồ Chí Minh" vs "Thành phố Hồ Chí Minh").
                // For this project, we'll focus on creating the address string.
            }

        } catch (error) {
            console.error("Error loading provinces:", error);
            provinceSelect.innerHTML = '<option value="">Lỗi tải dữ liệu</option>';
        }
    },
    
    // Assemble the full address string from the form elements
    getFullAddress: function(streetInputId, provinceSelectId, districtSelectId, wardSelectId) {
        const street = document.getElementById(streetInputId)?.value.trim() || '';
        const provinceSelect = document.getElementById(provinceSelectId);
        const districtSelect = document.getElementById(districtSelectId);
        const wardSelect = document.getElementById(wardSelectId);

        let parts = [];
        if (street) parts.push(street);
        
        if (wardSelect && wardSelect.selectedIndex > 0) {
            parts.push(wardSelect.options[wardSelect.selectedIndex].text);
        }
        if (districtSelect && districtSelect.selectedIndex > 0) {
            parts.push(districtSelect.options[districtSelect.selectedIndex].text);
        }
        if (provinceSelect && provinceSelect.selectedIndex > 0) {
            parts.push(provinceSelect.options[provinceSelect.selectedIndex].text);
        }

        return parts.join(', ');
    },
    
    // Basic validation
    validateAddressSelection: function(streetInputId, provinceSelectId, districtSelectId, wardSelectId) {
        const street = document.getElementById(streetInputId)?.value.trim();
        const pCode = document.getElementById(provinceSelectId)?.value;
        const dCode = document.getElementById(districtSelectId)?.value;
        const wCode = document.getElementById(wardSelectId)?.value;

        if (!street || !pCode || !dCode || !wCode) {
            return false;
        }
        return true;
    }
};
