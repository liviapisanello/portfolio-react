# Configuração do banco e do painel

1. Crie um projeto Supabase.
2. No SQL Editor, execute [`schema.sql`](./schema.sql).
3. Em Authentication, crie manualmente o usuário da proprietária e desative sign-ups públicos.
4. No SQL Editor, registre o UUID do usuário administrador:

   ```sql
   insert into public.app_admins (user_id)
   values ('UUID_DO_USUARIO_CRIADO_NO_SUPABASE');
   ```

5. Copie o Project URL, anon key e service role key para as variáveis correspondentes em `.env.local`/Vercel. A service role key só pode ser usada no servidor.

A tabela `messages` não tem política de leitura pública nem de inserção pelo cliente. O endpoint `/api/contact` usa a service role no servidor para salvar mensagens; a leitura e a alteração de status são exclusivas da conta registrada em `app_admins`. As preferências de destaques podem ser lidas anonimamente, mas só um administrador pode alterá-las.
