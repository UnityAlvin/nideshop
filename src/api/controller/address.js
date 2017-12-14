const Base = require('./base.js');

module.exports = class extends Base {
    /**
     * 获取用户的收货地址
     * @return {Promise} []
     */
    async listAction() {
        const addressList = await this.model('address').where({ user_id: think.userId }).select();
        let itemKey = 0;
        for (const addressItem of addressList) {
            let nowRegion = addressList[itemKey].region.split(",");
            addressList[itemKey].province_name = await this.model('region').getRegionName(addressItem.province_id);
            addressList[itemKey].city_name = await this.model('region').getRegionName(addressItem.city_id);
            addressList[itemKey].district_name = await this.model('region').getRegionName(addressItem.district_id);
            switch (nowRegion[1]) {
                case "北京市":
                case "上海市":
                case "天津市":
                case "重庆市":
                case "县":
                    nowRegion[1] = "";
                    break;
            }
            addressList[itemKey].full_region = nowRegion[0] + nowRegion[1] + nowRegion[2];
            addressList[itemKey].region = itemKey += 1;
        }

        return this.success(addressList);
    }

    /**
     * 获取收货地址的详情
     * @return {Promise} []
     */
    async detailAction() {
        const addressId = this.get('id');

        const addressInfo = await this.model('address').where({ user_id: think.userId, id: addressId }).find();
        if (!think.isEmpty(addressInfo)) {
            let nowRegion = addressInfo.region.split(",");
            addressInfo.province_name = await this.model('region').getRegionName(addressInfo.province_id);
            addressInfo.city_name = await this.model('region').getRegionName(addressInfo.city_id);
            addressInfo.district_name = await this.model('region').getRegionName(addressInfo.district_id);
            switch (nowRegion[1]) {
                case "北京市":
                case "上海市":
                case "天津市":
                case "重庆市":
                case "县":
                    nowRegion[1] = "";
                    break;
            }
            addressInfo.full_region = nowRegion[0] + nowRegion[1] + nowRegion[2];
        }

        return this.success(addressInfo);
    }

    /**
     * 添加或更新收货地址
     * @returns {Promise.<Promise|PreventPromise|void>}
     */
    async saveAction() {
        let addressId = this.post('id');
        think.logger.error(this.post('idcard'));
        const addressData = {
            name: this.post('name'),
            mobile: this.post('mobile'),
            idcard: this.post('idcard'),
            province_id: this.post('province_id'),
            city_id: this.post('city_id'),
            district_id: this.post('district_id'),
            address: this.post('address'),
            user_id: this.getLoginUserId(),
            is_default: this.post('is_default') === true ? 1 : 0,
            region: this.post('region').toString()
        };

        think.logger.info(this.post('region'));

        if (think.isEmpty(addressId)) {
            addressId = await this.model('address').add(addressData);
        } else {
            await this.model('address').where({ id: addressId, user_id: think.userId }).update(addressData);
        }

        // 如果设置为默认，则取消其它的默认
        if (this.post('is_default') === true) {
            await this.model('address').where({ id: ['<>', addressId], user_id: think.userId }).update({
                is_default: 0
            });
        }
        const addressInfo = await this.model('address').where({ id: addressId }).find();

        return this.success(addressInfo);
    }

    /**
     * 删除指定的收货地址
     * @returns {Promise.<Promise|PreventPromise|void>}
     */
    async deleteAction() {
        const addressId = this.post('id');

        await this.model('address').where({ id: addressId, user_id: think.userId }).delete();

        return this.success('删除成功');
    }
};