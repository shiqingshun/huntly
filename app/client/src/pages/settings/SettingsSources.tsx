import MainContainer from "../../components/MainContainer";
import { SourceManage } from "../../components/SettingModal/SourceManage";

const SettingsSources = () => {
    return (
        <MainContainer>
            <div className="settings-page-content p-4 max-w-4xl">
                <SourceManage />
            </div>
        </MainContainer>
    );
};

export default SettingsSources;
