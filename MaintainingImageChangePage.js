/*=============================================================================
 MaintainingImageChangePage.js
----------------------------------------------------------------------------
 (C)2020 Triacontane
 This software is released under the MIT License.
 http://opensource.org/licenses/mit-license.php
----------------------------------------------------------------------------
 Version
 1.0.0 2020/10/01 初版
----------------------------------------------------------------------------
 [Blog]   : https://triacontane.blogspot.jp/
 [Twitter]: https://twitter.com/triacontane/
 [GitHub] : https://github.com/triacontane/
=============================================================================*/

/*:
 * @plugindesc MaintainingImageChangePagePlugin
 * @author triacontane
 *
 * @param TagReverse
 * @text タグ反転
 * @desc タグの機能を反転させ、MaintainingImageが『ついていない』ときに画像を維持します。
 * @default false
 *
 * @help MaintainingImageChangePage.js
 *
 * When the event page is switched, the image specified
 * on the new page is 'None'.
 * then the image will be displayed as it was originally
 * displayed, without changing the image.
 * This is only valid for events with the following tags.
 * <MImage>
 *
 * The only thing to maintain is the image. Other settings,
 * such as priority, follow the settings of the new page.
 *
 * This plugin is released under the MIT License.
 */
/*:ja
 * @plugindesc ページ切り替え時の画像維持プラグイン
 * @author トリアコンタン
 *
 * @param TagReverse
 * @text タグ反転
 * @desc タグの機能を反転させ、MaintainingImageが『ついていない』ときに画像を維持します。
 * @default false
 *
 * @help MaintainingImageChangePage.js
 *
 * イベントページが切り替わったとき、新しいページで指定された画像が『なし』
 * であれば画像を変更せず、もともと表示していた画像をそのまま表示します。
 * 以下のタグが付いているイベントのみ有効です。
 * <MImage>
 *
 * 維持するのは画像のみです。プライオリティなど他の設定は新しいページの
 * 設定に従います。
 *
 * 利用規約：
 *  作者に無断で改変、再配布が可能で、利用形態（商用、18禁利用等）
 *  についても制限はありません。
 *  このプラグインはもうあなたのものです。
 */

(function() {
    'use strict';

    /**
     * Create plugin parameter. param[paramName] ex. param.commandPrefix
     * @param pluginName plugin name(EncounterSwitchConditions)
     * @returns {Object} Created parameter
     */
    var createPluginParameter = function(pluginName) {
        var paramReplacer = function(key, value) {
            if (value === 'null') {
                return value;
            }
            if (value[0] === '"' && value[value.length - 1] === '"') {
                return value;
            }
            try {
                return JSON.parse(value);
            } catch (e) {
                return value;
            }
        };
        var parameter     = JSON.parse(JSON.stringify(PluginManager.parameters(pluginName), paramReplacer));
        PluginManager.setParameters(pluginName, parameter);
        return parameter;
    };

    var param = createPluginParameter('MaintainingImageChangePage');


    var _Game_Event_initialize = Game_Event.prototype.initialize;
    Game_Event.prototype.initialize = function(mapId, eventId) {
        _Game_Event_initialize.apply(this, arguments);
        this._maintainingImage = this.isMaintainingImage();
    }

    Game_Event.prototype.isMaintainingImage = function() {
        return this.event().meta.MImage ^ param.TagReverse;
    };

    var _Game_Event_setupPageSettings = Game_Event.prototype.setupPageSettings;
    Game_Event.prototype.setupPageSettings = function() {
        if (this._maintainingImage) {
            this.saveMaintainingImage();
        }
        _Game_Event_setupPageSettings.apply(this, arguments);
        if (this._maintainingImage) {
            var image = this.page().image;
            if (!image.tileId && !image.characterName) {
                this.restoreMaintainingImage();
            }
        }
    };

    Game_Event.prototype.saveMaintainingImage = function() {
        this._prevTileId = this._tileId;
        this._prevCharacterName = this._characterName;
        this._prevCharacterIndex = this._characterIndex;
        this._prevIsObjectCharacter = this._isObjectCharacter;
    };

    Game_Event.prototype.restoreMaintainingImage = function() {
        this._tileId = this._prevTileId;
        this._characterName = this._prevCharacterName;
        this._characterIndex = this._prevCharacterIndex;
        this._isObjectCharacter = this._prevIsObjectCharacter;
    };
})();
