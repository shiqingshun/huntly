import MainContainer from "../../components/MainContainer";
import PageSetting from "../../components/SettingModal/PageSetting";

const SettingsPages = () => {
    return (
        <MainContainer>
            <div className="settings-page-content p-4 max-w-4xl">
                <PageSetting />
            </div>
        </MainContainer>
    );
};

export default SettingsPages;
