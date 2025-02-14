export declare class MailerService {
    private transporter;
    constructor();
    sendMail(to: string, subject: string, text: string): Promise<void>;
}
