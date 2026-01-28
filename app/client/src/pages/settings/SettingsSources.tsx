import MainContainer from "../../components/MainContainer";
import { SourceManage } from "../../components/SettingModal/SourceManage";
import SubHeader from "../../components/SubHeader";
import LanguageIcon from '@mui/icons-material/Language';

const SettingsSources = () => {
    return (
        <MainContainer>
            <SubHeader
                navLabel={{ labelText: 'Sources', labelIcon: LanguageIcon }}
                buttonOptions={{ markRead: false }}
            />
            <div className="settings-page-content p-4 max-w-4xl">
                <SourceManage />
            </div>
        </MainContainer>
    );
};

export default SettingsSources;
