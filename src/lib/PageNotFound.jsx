import { Link, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function PageNotFound() {
    const location = useLocation();
    const pageName = location.pathname.substring(1);

    const { data: authData, isFetched } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            try {
                const user = await base44.auth.me();
                return { user, isAuthenticated: true };
            } catch (error) {
                return { user: null, isAuthenticated: false };
            }
        }
    });

    return (
        <div className="relative min-h-screen flex items-center justify-center p-6 bg-[hsl(0,0%,5%)] text-white overflow-hidden">
            {/* Giant outlined 404 */}
            <span
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center font-heading font-bold text-outline-light select-none pointer-events-none leading-none"
                style={{ fontSize: 'clamp(14rem, 42vw, 34rem)' }}
            >
                404
            </span>

            <div className="relative max-w-md w-full text-center space-y-7">
                <img
                    src="/assets/tke-crest.webp"
                    alt="Tau Kappa Epsilon crest"
                    className="h-24 w-auto object-contain mx-auto drop-shadow-2xl"
                />

                <div className="space-y-3">
                    <h1 className="font-heading text-4xl sm:text-5xl font-bold">
                        Lost, <span className="text-primary">brother?</span>
                    </h1>
                    <p className="text-white/60 leading-relaxed">
                        The page <span className="font-medium text-white">"{pageName}"</span> doesn't exist.
                        Let's get you back to the chapter.
                    </p>
                </div>

                {isFetched && authData.isAuthenticated && authData.user?.role === 'admin' && (
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-left">
                        <p className="text-sm font-medium text-white mb-1">Admin Note</p>
                        <p className="text-sm text-white/60 leading-relaxed">
                            This could mean that the AI hasn't implemented this page yet. Ask it to implement it in the chat.
                        </p>
                    </div>
                )}

                <Link to="/" className="inline-block">
                    <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 h-12 px-8 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                        <Home className="h-4 w-4" /> Back to Home
                    </Button>
                </Link>
            </div>
        </div>
    );
}
