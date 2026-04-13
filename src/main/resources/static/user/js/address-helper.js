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
            const handleProvinceChange = async (pCode, selectedDistrictName = null, selectedWardName = null) => {
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

                    if (selectedDistrictName) {
                        for (let i = 0; i < districtSelect.options.length; i++) {
                            if (districtSelect.options[i].text === selectedDistrictName) {
                                districtSelect.selectedIndex = i;
                                await handleDistrictChange(districtSelect.value, selectedWardName);
                                break;
                            }
                        }
                    }
                }
            };

            // Handle District Change
            const handleDistrictChange = async (dCode, selectedWardName = null) => {
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

                    if (selectedWardName) {
                        for (let i = 0; i < wardSelect.options.length; i++) {
                            if (wardSelect.options[i].text === selectedWardName) {
                                wardSelect.selectedIndex = i;
                                break;
                            }
                        }
                    }
                }
            };

            provinceSelect.addEventListener('change', (e) => handleProvinceChange(e.target.value));
            districtSelect.addEventListener('change', (e) => handleDistrictChange(e.target.value));

            // Preselect if data is provided (by name)
            if (preselectedData) {
                const { province, district, ward } = preselectedData;
                if (province) {
                    for (let i = 0; i < provinceSelect.options.length; i++) {
                        if (provinceSelect.options[i].text === province) {
                            provinceSelect.selectedIndex = i;
                            await handleProvinceChange(provinceSelect.value, district, ward);
                            break;
                        }
                    }
                }
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
