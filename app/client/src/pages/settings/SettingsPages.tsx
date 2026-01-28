import MainContainer from "../../components/MainContainer";
import PageSetting from "../../components/SettingModal/PageSetting";
import SubHeader from "../../components/SubHeader";
import ArticleIcon from '@mui/icons-material/Article';

const SettingsPages = () => {
    return (
        <MainContainer>
            <SubHeader
                navLabel={{ labelText: 'Pages', labelIcon: ArticleIcon }}
                buttonOptions={{ markRead: false }}
            />
            <div className="settings-page-content p-4 max-w-4xl">
                <PageSetting />
            </div>
        </MainContainer>
    );
};

export default SettingsPages;
