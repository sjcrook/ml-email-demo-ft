import { useNavigate, useLocation } from 'react-router-dom';
import { AppBar, AppBarSection, AppBarSpacer, Drawer, DrawerContent, DrawerItem } from '@progress/kendo-react-layout';
import { Button } from '@progress/kendo-react-buttons';
import { Tooltip } from '@progress/kendo-react-tooltip';
import { APP_CONFIG } from '../local';
import APIClient from '../services/api-client';
import { useAuthStore, useNotificationStore } from "../store";
import { useState } from 'react';
import { menuIcon } from '@progress/kendo-svg-icons';


const NavigationDrawer = props => {
    const navigate = useNavigate();
    const location = useLocation();
    const [expanded, setExpanded] = useState(false);
    const { auth, clearAuth } = useAuthStore();
    const [selected, setSelected] = useState((auth?.authenticated ? APP_CONFIG.MENU_ITEMS_AUTHENTICATED : APP_CONFIG.MENU_ITEMS_GUEST).findIndex(x => x.selected === true));
    const addNotification = useNotificationStore(s => s.addNotification);

    const handleClick = () => {
        setExpanded(!expanded);
    };
    const onSelect = e => {
        navigate(e.itemTarget.props.route);
        setSelected(e.itemIndex);
        if (expanded) {
            setExpanded(false);
        }
    };

    const handleSignInRedirect = () => {
        navigate('/signin');
    };

    const signOut = async () => {
        try {
            const apiClient = new APIClient('/auth/out');
            const response = await apiClient.get();
            if (response.status !== 200) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            clearAuth();
            //setPending(false);
            return { success: true };
        } catch (error) {
            addNotification({
                style: 'error',
                icon: true,
                closable: true,
                message: "Error signing out: " + error.message,
                timeout: APP_CONFIG.NOTIFICATION_TIMEOUT_LONG
            });
            return { success: false };
        }
    };

    const handleSignOut = () => {
        signOut()
            .then(result => {
                if (result.success) {
                    navigate('/signin');
                }
            });
    };

    const alertsPage = () =>{
        navigate('/app/alerts')
    }

    return (
        <div>
            <div>
                <AppBar themeColor="dark">
                    <AppBarSection>
                        <Button svgIcon={menuIcon} fillMode="flat" onClick={handleClick} />
                        {/*<button className="k-button k-button-md k-rounded-md k-button-flat k-button-flat-base">
                            <SvgIcon icon={menuIcon} />
                        </button>*/}
                    </AppBarSection>
                    <AppBarSpacer style={{ width: 4 }} />
                    <AppBarSection>
                        { APP_CONFIG.APP_NAME }
                    </AppBarSection>
                    <AppBarSpacer />
                    <AppBarSection>
                        {
                            //authPending ? 'Fetching' :
                            //authError !== null ? 'Error' :
                            auth && auth.authenticated ? auth.username :
                            'Guest'
                        }
                    </AppBarSection>
                    <AppBarSpacer style={{ width: 4 }} />
                    <AppBarSection>
                        {
                            auth && auth.authenticated ?
                            <Tooltip anchorElement="target2">
                            <span id="group">
                                <button type="button" class="btn btn-info" onClick={alertsPage}> 
                                  <i class="fa fa-bell"></i>
                                </button>
                                <span class="badge badge-light">0</span>
                            </span>
                            </Tooltip> :
                            null
                        }
                    </AppBarSection>
                    <AppBarSpacer style={{ width: 4 }} />
                    <AppBarSection>
                        {
                            //authPending ? 'Fetching' :
                            //authError !== null ? 'Error' :
                            auth && auth.authenticated ?
                            <Tooltip anchorElement="target">
                                <span title="sign-out">
                                    <Button fillMode="flat" onClick={handleSignOut}>Sign-Out</Button>
                                </span>
                            </Tooltip> :
                            location.pathname != '/signin' ?
                            <Tooltip anchorElement="target">
                                <span title="sign-in">
                                    <Button fillMode="flat" onClick={handleSignInRedirect}>Sign-In</Button>
                                </span>
                            </Tooltip> :
                            null
                        }
                    </AppBarSection>
                    <AppBarSpacer style={{ width: 1 }} />
                </AppBar>
            </div>
            <Drawer
                expanded={expanded}
                position={'start'}
                mode={'push'}
                mini={true}
                items={
                    (auth?.authenticated ? APP_CONFIG.MENU_ITEMS_AUTHENTICATED : APP_CONFIG.MENU_ITEMS_GUEST).map((item, index) => ({
                        ...item,
                        selected: index === selected
                    }))
                }
                onSelect={onSelect}
            >
                <DrawerContent>
                    {props.children}
                </DrawerContent>
            </Drawer>
        </div>
    );
};

export default NavigationDrawer;